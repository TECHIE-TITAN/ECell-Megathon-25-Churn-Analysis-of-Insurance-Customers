import argparse
import json
import os
import warnings
from typing import List, Dict

import joblib
import numpy as np
import pandas as pd
import shap

warnings.filterwarnings("ignore")

# Ensure matplotlib can render without a GUI/display
os.environ.setdefault("MPLBACKEND", "Agg")

# Utility functions

def group_shap_by_original_feature(shap_values: np.ndarray, feature_names: List[str]) -> Dict[str, float]:
    """
    Aggregate absolute mean SHAP across one-hot columns back to their original raw feature name.
    Assumes that one-hot columns are named in pandas get_dummies style: "<feature>_<category>".
    For numeric features, names remain unchanged and aggregate to themselves.
    """
    agg: Dict[str, List[float]] = {}
    for i, name in enumerate(feature_names):
        # split on first underscore only; if no underscore, whole name is original
        if "_" in name:
            orig = name.split("_", 1)[0]
        else:
            orig = name
        agg.setdefault(orig, []).append(np.abs(shap_values[:, i]))
    # mean of absolute values per original feature
    grouped = {k: float(np.mean(np.concatenate(v))) for k, v in agg.items()}
    return grouped


def parse_args():
    p = argparse.ArgumentParser(description="Generate SHAP explanations and regional insights for churn model.")
    p.add_argument("--input", required=True, help="Path to CSV to explain (should match training schema)")
    p.add_argument("--model", default="churn_model.pkl", help="Path to trained model joblib file")
    p.add_argument("--features", default="model_features.pkl", help="Path to saved features list")
    p.add_argument("--metadata", default="model_metadata.json", help="Path to metadata JSON from training")
    p.add_argument("--target", default="Churn", help="Target column name if present")
    p.add_argument("--drop-cols", default="individual_id,address_id", help="Columns to drop before encoding")
    p.add_argument("--sample", type=int, default=5000, help="Max rows to compute SHAP on (performance)")
    p.add_argument("--outdir", default="shap_reports", help="Directory to write reports and plots")
    p.add_argument("--threshold", type=float, default=0.5, help="Decision threshold for labeling")
    p.add_argument("--group-topn", type=int, default=20, help="Top-N grouped features to keep in regional reports")
    p.add_argument(
        "--group-by",
        default=None,
        help="Comma-separated list of columns to use for regional summaries (e.g., 'Geographic_Cluster,state'). Overrides metadata if provided.",
    )
    p.add_argument("--top-k-locals", type=int, default=10, help="Number of highest-risk rows to render local plots for")
    return p.parse_args()


def main():
    args = parse_args()
    os.makedirs(args.outdir, exist_ok=True)

    # Load artifacts
    model = joblib.load(args.model)
    model_features: List[str] = joblib.load(args.features)

    metadata = {}
    if os.path.exists(args.metadata):
        with open(args.metadata, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    target = metadata.get("target", args.target)
    drop_cols = metadata.get("drop_cols", [c for c in args.drop_cols.split(",") if c])
    raw_feature_names = metadata.get("raw_feature_names", None)
    # Determine regional grouping columns: CLI overrides metadata
    if args.group_by:
        suggested_group_by = [c for c in args.group_by.split(",") if c]
    else:
        suggested_group_by = metadata.get("suggested_group_by", [])

    # Load and prepare data
    df = pd.read_csv(args.input)
    original = df.copy()
    X = df.drop(columns=[c for c in ([target] + drop_cols) if c in df.columns])
    X = pd.get_dummies(X, drop_first=True)
    X = X.reindex(columns=model_features, fill_value=0)

    # Optional subsample for SHAP performance
    if len(X) > args.sample:
        X_shap = X.sample(args.sample, random_state=42)
        original_shap = original.loc[X_shap.index]
    else:
        X_shap = X
        original_shap = original

    # Compute SHAP values
    # Use TreeExplainer fast path if available
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_shap)
    # For XGBClassifier, shap_values can be 1D for logits or list; normalize to 2D array for positive class
    if isinstance(shap_values, list):
        shap_pos = shap_values[1] if len(shap_values) > 1 else shap_values[0]
    else:
        shap_pos = shap_values

    # Expected value for positive class if available
    expected_value = explainer.expected_value
    try:
        if isinstance(expected_value, (list, tuple, np.ndarray)):
            expected_value = expected_value[1] if len(expected_value) > 1 else expected_value[0]
    except Exception:
        pass

    # Global grouped importance (original features)
    grouped = group_shap_by_original_feature(shap_pos, list(X_shap.columns))
    global_df = pd.DataFrame({"feature": list(grouped.keys()), "mean_abs_shap": list(grouped.values())})
    global_df = global_df.sort_values("mean_abs_shap", ascending=False)
    global_csv = os.path.join(args.outdir, "shap_global_importance_grouped.csv")
    global_df.to_csv(global_csv, index=False)

    # Save a bar plot (optional, safe if matplotlib present)
    try:
        import matplotlib.pyplot as plt

        topn = 25
        plt.figure(figsize=(10, 6))
        plt.barh(global_df.head(topn)["feature"][::-1], global_df.head(topn)["mean_abs_shap"][::-1])
        plt.xlabel("Mean |SHAP| (grouped)")
        plt.ylabel("Feature")
        plt.title("Global Feature Importance (Grouped by Original Feature)")
        plt.tight_layout()
        plt.savefig(os.path.join(args.outdir, "shap_global_importance_grouped_top25.png"))
        plt.close()
    except Exception:
        pass

    # Local explanations for a few top-risk individuals
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_shap)[:, 1]
    else:
        probs = (model.predict(X_shap).astype(float))

    orig_with_scores = original_shap.copy()
    orig_with_scores["predicted_churn_probability"] = probs
    top_idx = np.argsort(-probs)[: args.top_k_locals]
    local_dir = os.path.join(args.outdir, "local_explanations")
    os.makedirs(local_dir, exist_ok=True)

    # Save each as a small CSV + robust plots (always write a bar chart; try waterfall too)
    for i in top_idx:
        ridx = orig_with_scores.index[i]
        row_X = X_shap.iloc[i : i + 1]
        row_proba = float(probs[i])
        # per-row shap values shape (1, n_features)
        row_shap = np.array(shap_pos[i : i + 1])

        # Group per-row SHAP back to original features (sum absolute contributions)
        per_row_grouped = group_shap_by_original_feature(row_shap, list(X_shap.columns))
        per_row_df = (
            pd.DataFrame({"feature": list(per_row_grouped.keys()), "abs_shap": list(per_row_grouped.values())})
            .sort_values("abs_shap", ascending=False)
        )
        per_row_df.to_csv(os.path.join(local_dir, f"row_{ridx}_grouped_shap.csv"), index=False)

        # Robust local plots: always save a bar chart; also try to save a waterfall
        try:
            import matplotlib.pyplot as plt
            # Always write bar chart (grouped, top 20)
            plt.figure(figsize=(9, 6))
            tmp = per_row_df.head(20).iloc[::-1]
            plt.barh(tmp["feature"], tmp["abs_shap"])
            plt.xlabel("|SHAP| contribution")
            plt.title(f"Top factors for row {ridx} (grouped)")
            plt.tight_layout()
            plt.savefig(os.path.join(local_dir, f"row_{ridx}_bar.png"))
            plt.close()

            # Try a waterfall plot as well (if supported by current SHAP version)
            try:
                exp = shap.Explanation(
                    values=shap_pos[i],
                    base_values=expected_value,
                    data=row_X.iloc[0].values,
                    feature_names=list(X_shap.columns),
                )
                plt.figure(figsize=(9, 6))
                shap.plots.waterfall(exp, max_display=20, show=False)
                plt.tight_layout()
                plt.savefig(os.path.join(local_dir, f"row_{ridx}_waterfall.png"))
                plt.close()
            except Exception:
                # Waterfall unavailable; bar already saved
                pass
        except Exception:
            pass

    # Regional trends: group by cluster or geography
    # Auto-detect all *_Cluster columns present and union with CLI/metadata suggestions
    auto_cluster_cols = [c for c in original.columns if isinstance(c, str) and c.endswith("_Cluster")]
    preferred_cols = [c for c in suggested_group_by if c in original.columns]
    regional_cols = []
    for c in preferred_cols + auto_cluster_cols:
        if c not in regional_cols and c in original.columns:
            regional_cols.append(c)
    if regional_cols:
        for grp in regional_cols:
            # Assign region from original_shap for the sampled set
            region_series = original_shap[grp]

            # Summary probabilities per region
            region_summary = (
                pd.DataFrame({
                    grp: region_series.values,
                    "predicted_churn_probability": probs,
                })
                .groupby(grp, dropna=False)
                .agg(
                    count=("predicted_churn_probability", "size"),
                    mean_proba=("predicted_churn_probability", "mean"),
                    median_proba=("predicted_churn_probability", "median"),
                )
                .reset_index()
                .sort_values("mean_proba", ascending=False)
            )
            region_summary.to_csv(os.path.join(args.outdir, f"regional_summary__{grp}.csv"), index=False)

            # Grouped SHAP importances per region
            # Build a dataframe of abs shap per feature
            abs_shap = np.abs(shap_pos)
            abs_df = pd.DataFrame(abs_shap, index=X_shap.index, columns=list(X_shap.columns))
            abs_df[grp] = region_series.values
            # Mean abs shap per feature per region
            mean_abs_by_region = abs_df.groupby(grp, dropna=False).mean(numeric_only=True)

            # Convert per-region feature means to grouped original features
            rows = []
            for region_value, row in mean_abs_by_region.iterrows():
                grouped_map = group_shap_by_original_feature(row.values.reshape(1, -1), list(mean_abs_by_region.columns))
                # Keep top-N for brevity
                top_items = sorted(grouped_map.items(), key=lambda kv: kv[1], reverse=True)[: args.group_topn]
                for rank, (feat, score) in enumerate(top_items, start=1):
                    rows.append({grp: region_value, "feature": feat, "mean_abs_shap": score, "rank": rank})

            if rows:
                regional_imp_df = pd.DataFrame(rows)
                regional_imp_df.to_csv(os.path.join(args.outdir, f"shap_grouped_importance_by_{grp}.csv"), index=False)

    # Save an index with top rows and their grouped SHAP summaries
    index_csv = os.path.join(args.outdir, "top_risk_index.csv")
    orig_with_scores.sort_values("predicted_churn_probability", ascending=False).head(200).to_csv(index_csv, index=False)

    # Produce a simple HTML index for non-technical browsing
    try:
        html = [
            "<html><head><meta charset='utf-8'><title>Churn SHAP Reports</title>",
            "<style>body{font-family:Segoe UI,Arial,sans-serif;margin:24px} h2{margin-top:28px} li{margin:6px 0}</style>",
            "</head><body>",
            "<h1>Churn Explanations and Regional Insights</h1>",
            f"<p>Input file: {os.path.abspath(args.input)}</p>",
            "<h2>Global Importance</h2>",
            f"<ul><li><a href='shap_global_importance_grouped.csv'>Global grouped importance (CSV)</a></li>",
            f"<li><a href='shap_global_importance_grouped_top25.png'>Top 25 grouped importance (PNG)</a></li></ul>",
            "<h2>Top-Risk Individuals</h2>",
            f"<ul><li><a href='top_risk_index.csv'>Top risk index (CSV)</a></li>",
            f"<li>Local explanations (CSVs + bar charts, plus waterfall if available) are under <code>local_explanations/</code></li></ul>",
        ]
        if regional_cols:
            html.append("<h2>Regional Summaries</h2><ul>")
            for grp in regional_cols:
                html.append(f"<li><a href='regional_summary__{grp}.csv'>Summary by {grp}</a></li>")
                html.append(f"<li><a href='shap_grouped_importance_by_{grp}.csv'>Top features by {grp}</a></li>")
            html.append("</ul>")
        html.append("</body></html>")
        with open(os.path.join(args.outdir, "index.html"), "w", encoding="utf-8") as f:
            f.write("\n".join(html))
    except Exception:
        pass

    print("SHAP reports generated in:", os.path.abspath(args.outdir))


if __name__ == "__main__":
    main()