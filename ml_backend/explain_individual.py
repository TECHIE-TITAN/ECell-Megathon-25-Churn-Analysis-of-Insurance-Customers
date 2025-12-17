#!/usr/bin/env python3
"""
Individual Customer SHAP Explainer
Generate SHAP force plots and explanations for specific individual_id values
"""

import argparse
import json
import os
import warnings
from typing import List, Dict, Optional

import joblib
import numpy as np
import pandas as pd
import shap

warnings.filterwarnings("ignore")

# Ensure matplotlib can render without GUI
os.environ.setdefault("MPLBACKEND", "Agg")

def group_shap_by_original_feature(shap_values: np.ndarray, feature_names: List[str]) -> Dict[str, float]:
    """
    Aggregate SHAP values across one-hot columns back to their original raw feature name.
    """
    agg: Dict[str, List[float]] = {}
    for i, name in enumerate(feature_names):
        if "_" in name:
            orig = name.split("_", 1)[0]
        else:
            orig = name
        agg.setdefault(orig, []).append(shap_values[i])
    
    # Sum the SHAP values for each original feature (preserving direction)
    grouped = {k: float(np.sum(v)) for k, v in agg.items()}
    return grouped

def parse_args():
    p = argparse.ArgumentParser(description="Generate SHAP explanations for specific individual_id values")
    p.add_argument("--input", required=True, help="Path to CSV with individual_id and predictions")
    p.add_argument("--individual-id", required=True, help="Individual ID to explain")
    p.add_argument("--model", default="churn_model.pkl", help="Path to trained model")
    p.add_argument("--features", default="model_features.pkl", help="Path to saved features list")
    p.add_argument("--metadata", default="model_metadata.json", help="Path to metadata JSON")
    p.add_argument("--target", default="Churn", help="Target column name if present")
    p.add_argument("--drop-cols", default="individual_id,address_id", help="Columns to drop before encoding")
    p.add_argument("--outdir", default="individual_shap", help="Directory to save explanation")
    p.add_argument("--show-top-n", type=int, default=20, help="Number of top features to show in plots")
    return p.parse_args()

def main():
    args = parse_args()
    os.makedirs(args.outdir, exist_ok=True)
    
    # Load artifacts
    print(f"Loading model from {args.model}...")
    model = joblib.load(args.model)
    model_features: List[str] = joblib.load(args.features)
    
    metadata = {}
    if os.path.exists(args.metadata):
        with open(args.metadata, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    
    target = metadata.get("target", args.target)
    drop_cols = metadata.get("drop_cols", [c for c in args.drop_cols.split(",") if c])
    
    # Load and find the specific individual
    print(f"Loading data from {args.input}...")
    df = pd.read_csv(args.input)
    
    if 'individual_id' not in df.columns:
        raise ValueError("Input CSV must contain 'individual_id' column")
    
    # Find the specific individual (handle both string and numeric IDs)
    target_id = args.individual_id
    
    # Debug: Show some sample IDs and their types
    print(f"Looking for individual_id: '{target_id}' (type: {type(target_id)})")
    print(f"Sample IDs from dataset: {df['individual_id'].head().tolist()}")
    print(f"ID column dtype: {df['individual_id'].dtype}")
    
    # Try different matching strategies
    individual_mask = None
    
    # Strategy 1: Direct match
    individual_mask = df['individual_id'] == target_id
    if individual_mask.any():
        print("Found using direct string match")
    else:
        # Strategy 2: Convert target to numeric if possible
        try:
            target_id_num = int(target_id)
            individual_mask = df['individual_id'] == target_id_num
            if individual_mask.any():
                print("Found using numeric conversion")
        except ValueError:
            pass
    
    # Strategy 3: Convert both to strings
    if individual_mask is None or not individual_mask.any():
        individual_mask = df['individual_id'].astype(str) == str(target_id)
        if individual_mask.any():
            print("Found using string conversion")
    
    # Strategy 4: Strip whitespace and try again
    if not individual_mask.any():
        individual_mask = df['individual_id'].astype(str).str.strip() == str(target_id).strip()
        if individual_mask.any():
            print("Found after stripping whitespace")
    
    if not individual_mask.any():
        print(f"Individual ID '{args.individual_id}' not found in dataset")
        print(f"Total records: {len(df)}")
        print("First 10 individual_ids in dataset:")
        for i, uid in enumerate(df['individual_id'].head(10)):
            print(f"  {i}: '{uid}' (type: {type(uid)})")
        
        # Try to find similar IDs
        similar_ids = df[df['individual_id'].astype(str).str.contains(str(target_id)[:8], na=False)]
        if len(similar_ids) > 0:
            print(f"Found {len(similar_ids)} IDs containing '{str(target_id)[:8]}':")
            for uid in similar_ids['individual_id'].head(5):
                print(f"  '{uid}'")
        
        raise ValueError(f"Individual ID '{args.individual_id}' not found in dataset")
    
    individual_row = df[individual_mask].iloc[0]
    individual_idx = df[individual_mask].index[0]
    
    print(f"Found individual {args.individual_id} at row index {individual_idx}")
    
    # Prepare the data for SHAP (same preprocessing as training)
    X_all = df.drop(columns=[c for c in ([target] + drop_cols) if c in df.columns])
    X_all = pd.get_dummies(X_all, drop_first=True)
    X_all = X_all.reindex(columns=model_features, fill_value=0)
    
    # Get the specific individual's features
    X_individual = X_all.loc[individual_idx:individual_idx]  # Keep as DataFrame
    
    # Get prediction for this individual
    if hasattr(model, "predict_proba"):
        individual_prob = model.predict_proba(X_individual)[0, 1]
        individual_pred = int(individual_prob >= 0.5)
    else:
        individual_pred = model.predict(X_individual)[0]
        individual_prob = float(individual_pred)
    
    print(f"Individual {args.individual_id} prediction:")
    print(f"  Churn Probability: {individual_prob:.4f}")
    print(f"  Churn Prediction: {individual_pred}")
    if target in df.columns:
        actual_churn = individual_row[target]
        print(f"  Actual Churn: {actual_churn}")
    
    # Compute SHAP values for this individual
    print("Computing SHAP explanations...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_individual)
    
    # Handle different SHAP output formats
    if isinstance(shap_values, list):
        shap_pos = shap_values[1] if len(shap_values) > 1 else shap_values[0]
    else:
        shap_pos = shap_values
    
    # Ensure we have the right shape (1, n_features)
    if shap_pos.ndim == 1:
        shap_pos = shap_pos.reshape(1, -1)
    
    # Expected value
    expected_value = explainer.expected_value
    try:
        if isinstance(expected_value, (list, tuple, np.ndarray)):
            expected_value = expected_value[1] if len(expected_value) > 1 else expected_value[0]
    except Exception:
        pass
    
    print(f"Base prediction (expected value): {expected_value:.4f}")
    
    # Create grouped SHAP explanation
    individual_shap_1d = shap_pos[0]  # Shape: (n_features,)
    grouped_shap = group_shap_by_original_feature(individual_shap_1d, list(X_individual.columns))
    
    # Sort by absolute importance
    grouped_df = pd.DataFrame([
        {"feature": feat, "shap_value": val, "abs_shap": abs(val)}
        for feat, val in grouped_shap.items()
    ]).sort_values("abs_shap", ascending=False)
    
    # Save detailed explanation CSV
    csv_path = os.path.join(args.outdir, f"individual_{args.individual_id}_explanation.csv")
    
    # Add feature values to the explanation
    explanation_data = []
    for _, row in grouped_df.iterrows():
        feat = row["feature"]
        shap_val = row["shap_value"]
        
        # Try to get the original feature value
        if feat in individual_row:
            feat_value = individual_row[feat]
        else:
            # For features that got one-hot encoded, show which categories are active
            one_hot_cols = [col for col in X_individual.columns if col.startswith(f"{feat}_")]
            active_cats = [col.split("_", 1)[1] for col in one_hot_cols if X_individual[col].iloc[0] == 1]
            feat_value = f"Categories: {', '.join(active_cats)}" if active_cats else "Base category"
        
        explanation_data.append({
            "feature": feat,
            "feature_value": feat_value,
            "shap_value": shap_val,
            "abs_shap_value": abs(shap_val),
            "impact": "Increases churn risk" if shap_val > 0 else "Decreases churn risk"
        })
    
    explanation_df = pd.DataFrame(explanation_data)
    explanation_df.to_csv(csv_path, index=False)
    print(f"Detailed explanation saved to: {csv_path}")
    
    # Create visualizations
    try:
        import matplotlib.pyplot as plt
        
        # 1. Horizontal bar chart of top features (grouped)
        plt.figure(figsize=(10, 8))
        top_features = grouped_df.head(args.show_top_n)
        colors = ['red' if x > 0 else 'blue' for x in top_features['shap_value']]
        
        plt.barh(range(len(top_features)), top_features['shap_value'], color=colors)
        plt.yticks(range(len(top_features)), top_features['feature'])
        plt.xlabel('SHAP Value (Impact on Prediction)')
        plt.title(f'Top {args.show_top_n} Features Explaining Individual {args.individual_id}\n'
                 f'Churn Probability: {individual_prob:.3f}')
        plt.axvline(x=0, color='black', linestyle='-', alpha=0.3)
        
        # Add value labels
        for i, v in enumerate(top_features['shap_value']):
            plt.text(v + (0.001 if v >= 0 else -0.001), i, f'{v:.3f}', 
                    ha='left' if v >= 0 else 'right', va='center')
        
        plt.tight_layout()
        bar_path = os.path.join(args.outdir, f"individual_{args.individual_id}_bar_chart.png")
        plt.savefig(bar_path, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"Bar chart saved to: {bar_path}")
        
        # 2. SHAP waterfall plot (if supported)
        try:
            # Create SHAP Explanation object for waterfall
            exp = shap.Explanation(
                values=individual_shap_1d,
                base_values=expected_value,
                data=X_individual.iloc[0].values,
                feature_names=list(X_individual.columns)
            )
            
            plt.figure(figsize=(10, 12))
            shap.plots.waterfall(exp, max_display=args.show_top_n, show=False)
            plt.tight_layout()
            waterfall_path = os.path.join(args.outdir, f"individual_{args.individual_id}_waterfall.png")
            plt.savefig(waterfall_path, dpi=300, bbox_inches='tight')
            plt.close()
            print(f"Waterfall plot saved to: {waterfall_path}")
            
        except Exception as e:
            print(f"Could not create waterfall plot: {e}")
        
        # 3. SHAP force plot
        try:
            plt.figure(figsize=(12, 6))
            shap.plots.force(expected_value, individual_shap_1d, X_individual.iloc[0], 
                           matplotlib=True, show=False, figsize=(12, 6))
            plt.tight_layout()
            force_path = os.path.join(args.outdir, f"individual_{args.individual_id}_force.png")
            plt.savefig(force_path, dpi=300, bbox_inches='tight')
            plt.close()
            print(f"Force plot saved to: {force_path}")
            
        except Exception as e:
            print(f"Could not create force plot: {e}")
            
    except ImportError:
        print("Matplotlib not available; skipping visualizations")
    except Exception as e:
        print(f"Error creating visualizations: {e}")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"EXPLANATION SUMMARY for Individual {args.individual_id}")
    print(f"{'='*60}")
    print(f"Base risk (population average): {expected_value:.4f}")
    print(f"Individual's risk: {individual_prob:.4f}")
    print(f"Risk adjustment: {individual_prob - expected_value:+.4f}")
    print(f"\nTop 10 factors:")
    
    for i, (_, row) in enumerate(grouped_df.head(10).iterrows(), 1):
        direction = "↑" if row['shap_value'] > 0 else "↓"
        print(f"{i:2d}. {row['feature']:<20} {direction} {row['shap_value']:+.4f}")
    
    print(f"\nFiles created in {os.path.abspath(args.outdir)}:")
    print(f"  - individual_{args.individual_id}_explanation.csv")
    print(f"  - individual_{args.individual_id}_bar_chart.png")
    print(f"  - individual_{args.individual_id}_waterfall.png (if supported)")
    print(f"  - individual_{args.individual_id}_force.png (if supported)")

if __name__ == "__main__":
    main()