from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import shap
import joblib
import json
import sys
from pathlib import Path
import os

# Get the project root directory (2 levels up from backend/api/)
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / 'backend' / 'ml'))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration - use absolute paths from project root
MODEL_FILENAME = str(PROJECT_ROOT / 'backend' / 'models' / 'churn_model.pkl')
COMPANY_DATA_FILENAME = str(PROJECT_ROOT / 'data' / 'company_data.csv')

CATEGORICAL_COLS = [
    'city', 'marital_status', 'acct_suspd_date', 'cust_orig_date',
    'state', 'county', 'home_market_value'
]

IDENTIFIER_COLS = ['individual_id', 'address_id']

# Global variables to store loaded model and data
analyzer = None
company_data = None

class ShapDashboardAnalyzer:
    """Handles real-time SHAP analysis for customer churn prediction."""
    def __init__(self, model, explainer, model_features):
        self.model = model
        self.explainer = explainer
        self.model_features = model_features

    def analyze_customer(self, customer_data):
        """Analyze customer with provided data and return SHAP values."""
        try:
            # Preprocess the data
            df = pd.DataFrame([customer_data])
            
            # Remove identifier columns if present
            df_features = df.drop(columns=[col for col in IDENTIFIER_COLS if col in df.columns], errors='ignore')
            
            # One-hot encode categorical columns
            categorical_present = [col for col in CATEGORICAL_COLS if col in df_features.columns]
            df_encoded = pd.get_dummies(df_features, columns=categorical_present)
            
            # Align with model features
            df_aligned = df_encoded.reindex(columns=self.model_features, fill_value=0)
            
            # Get prediction
            prediction_proba = self.model.predict_proba(df_aligned)[0]
            churn_probability = float(prediction_proba[1])
            
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(df_aligned)
            
            # Format SHAP data
            shap_data = []
            for feature_name, shap_value in zip(df_aligned.columns, shap_values[0]):
                # Extract original feature name (before one-hot encoding)
                original_feature = feature_name
                for cat_col in CATEGORICAL_COLS:
                    if feature_name.startswith(cat_col):
                        original_feature = cat_col
                        break
                
                shap_data.append({
                    "feature": feature_name,
                    "original_feature": original_feature,
                    "shap_value": float(shap_value),
                    "feature_value": float(df_aligned[feature_name].iloc[0]),
                    "impact": "increases_churn" if shap_value > 0 else "decreases_churn"
                })
            
            # Sort by absolute SHAP value
            shap_data_sorted = sorted(shap_data, key=lambda x: abs(x['shap_value']), reverse=True)
            
            # Aggregate by original feature
            aggregated_shap = {}
            for item in shap_data:
                orig_feat = item['original_feature']
                if orig_feat not in aggregated_shap:
                    aggregated_shap[orig_feat] = {
                        "feature": orig_feat,
                        "total_shap_value": 0,
                        "impact": item['impact']
                    }
                aggregated_shap[orig_feat]['total_shap_value'] += item['shap_value']
            
            aggregated_list = sorted(
                aggregated_shap.values(),
                key=lambda x: abs(x['total_shap_value']),
                reverse=True
            )
            
            return {
                "success": True,
                "customer_id": customer_data.get('individual_id', 'New Customer'),
                "prediction": {
                    "churn_probability": churn_probability,
                    "will_churn": churn_probability > 0.5,
                    "confidence": float(max(prediction_proba[0], prediction_proba[1]))
                },
                "shap_analysis": {
                    "base_value": float(self.explainer.expected_value),
                    "top_features": shap_data_sorted[:15],
                    "aggregated_features": aggregated_list[:10],
                    "total_features_analyzed": len(shap_data)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error analyzing customer: {str(e)}"
            }

def initialize_analyzer():
    """Initialize the SHAP analyzer on server startup."""
    global analyzer, company_data
    
    print("🔄 Loading model and data...")
    try:
        model = joblib.load(MODEL_FILENAME)
        
        # Load company data CSV
        if not Path(COMPANY_DATA_FILENAME).exists():
            raise FileNotFoundError(f"Company data file not found: {COMPANY_DATA_FILENAME}")
        
        print(f"📂 Loading data from: {COMPANY_DATA_FILENAME}")
        company_data = pd.read_csv(COMPANY_DATA_FILENAME)
        
        print("🔄 Initializing SHAP explainer...")
        explainer = shap.TreeExplainer(model)
        model_features = model.get_booster().feature_names
        
        analyzer = ShapDashboardAnalyzer(model, explainer, model_features)
        print("✅ SHAP Analyzer initialized successfully!")
        print(f"📊 Loaded {len(company_data)} customers from database")
        
    except FileNotFoundError as e:
        print(f"❌ Error: Could not find required file: {e}")
        print("⚠️  Server will start but SHAP analysis will not be available.")
    except Exception as e:
        print(f"❌ Error initializing analyzer: {e}")
        print("⚠️  Server will start but SHAP analysis will not be available.")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "analyzer_ready": analyzer is not None,
        "customers_loaded": len(company_data) if company_data is not None else 0
    })

@app.route('/api/customer/<customer_id>', methods=['GET'])
def get_customer_data(customer_id):
    """Get customer data by ID."""
    if company_data is None:
        return jsonify({
            "error": "Company data not loaded. Please check server logs."
        }), 503
    
    customer = company_data[company_data['individual_id'] == customer_id]
    
    if customer.empty:
        return jsonify({
            "error": f"Customer ID '{customer_id}' not found in database."
        }), 404
    
    return jsonify(customer.iloc[0].to_dict())

@app.route('/api/analyze', methods=['POST'])
def analyze_customer_endpoint():
    """
    Analyze customer data provided in JSON format.
    Can accept either:
    1. Full customer data JSON
    2. Just customer_id to lookup from database
    """
    if analyzer is None:
        return jsonify({
            "error": "SHAP analyzer not initialized."
        }), 503
    
    request_data = request.json
    
    if not request_data:
        return jsonify({
            "error": "No data provided"
        }), 400
    
    # Check if it's just a customer_id lookup
    if 'customer_id' in request_data and len(request_data) == 1:
        customer_id = request_data['customer_id']
        
        if company_data is None:
            return jsonify({
                "error": "Company data not loaded."
            }), 503
        
        # Lookup customer in database
        customer = company_data[company_data['individual_id'] == customer_id]
        
        if customer.empty:
            return jsonify({
                "error": f"Customer ID '{customer_id}' not found in database."
            }), 404
        
        # Get full customer data as dict
        customer_data_dict = customer.iloc[0].to_dict()
    else:
        # Use provided customer data
        customer_data_dict = request_data
    
    # Analyze the customer
    result = analyzer.analyze_customer(customer_data_dict)
    
    if not result.get('success', False):
        return jsonify(result), 400
    
    return jsonify(result)

@app.route('/api/predict', methods=['POST'])
def predict_customer():
    """
    Get prediction and SHAP values for customer data.
    Alias for /api/analyze endpoint for backward compatibility.
    """
    return analyze_customer_endpoint()

@app.route('/api/simulate', methods=['POST'])
def simulate_changes():
    """
    Simulate changes to customer parameters and return new analysis.
    Accepts modified customer data and returns prediction + SHAP analysis.
    This endpoint is optimized for real-time simulation in the dashboard.
    """
    if analyzer is None:
        return jsonify({
            "error": "SHAP analyzer not initialized."
        }), 503
    
    request_data = request.json
    
    if not request_data:
        return jsonify({
            "error": "No data provided"
        }), 400
    
    # Expect full customer data for simulation
    customer_data_dict = request_data
    
    # Analyze the modified customer data
    result = analyzer.analyze_customer(customer_data_dict)
    
    if not result.get('success', False):
        return jsonify(result), 400
    
    # Add simulation flag to response
    result['is_simulation'] = True
    
    return jsonify(result)

@app.route('/api/regional-insights', methods=['GET'])
def get_regional_insights():
    """
    Generate regional insights using SHAP analysis on different customer segments.
    Groups by: Geographic_Cluster, Demographics_Cluster, Financial_Cluster, Policy_Behavioral_Cluster, state
    """
    if analyzer is None or company_data is None:
        return jsonify({
            "error": "Analyzer or company data not initialized."
        }), 503
    
    try:
        # Use all available customer data (removed 10k limit)
        df_sample = company_data.copy()
        sample_size = len(df_sample)
        
        print(f"🔍 Analyzing regional insights for {sample_size} customers...")
        
        # Prepare features for SHAP analysis
        df_features = df_sample.drop(columns=[col for col in IDENTIFIER_COLS + ['Churn', 'predicted_churn', 'predicted_churn_probability'] if col in df_sample.columns], errors='ignore')
        
        # Store cluster columns before encoding
        cluster_cols = ['Geographic_Cluster', 'Demographics_Cluster', 'Financial_Cluster', 'Policy_Behavioral_Cluster', 'state']
        cluster_data = {}
        for col in cluster_cols:
            if col in df_sample.columns:
                cluster_data[col] = df_sample[col].values
        
        # One-hot encode
        categorical_present = [col for col in CATEGORICAL_COLS if col in df_features.columns]
        df_encoded = pd.get_dummies(df_features, columns=categorical_present)
        df_aligned = df_encoded.reindex(columns=analyzer.model_features, fill_value=0)
        
        # Get predictions and SHAP values
        predictions = analyzer.model.predict_proba(df_aligned)[:, 1]
        shap_values = analyzer.explainer.shap_values(df_aligned)
        
        # Calculate absolute SHAP values
        abs_shap = np.abs(shap_values)
        
        # Regional analysis results
        regional_data = {}
        
        for cluster_col, cluster_values in cluster_data.items():
            unique_clusters = np.unique(cluster_values)
            cluster_insights = []
            
            for cluster_id in unique_clusters:
                if pd.isna(cluster_id):
                    continue
                    
                mask = cluster_values == cluster_id
                cluster_predictions = predictions[mask]
                cluster_shap = abs_shap[mask]
                
                # Calculate statistics
                avg_churn_prob = float(np.mean(cluster_predictions))
                median_churn_prob = float(np.median(cluster_predictions))
                customer_count = int(np.sum(mask))
                high_risk_count = int(np.sum(cluster_predictions > 0.5))
                
                # Top features by mean absolute SHAP
                mean_shap_by_feature = np.mean(cluster_shap, axis=0)
                top_feature_indices = np.argsort(mean_shap_by_feature)[-10:][::-1]
                
                top_features = []
                for idx in top_feature_indices:
                    feature_name = analyzer.model_features[idx]
                    # Extract original feature name
                    original_feature = feature_name
                    for cat_col in CATEGORICAL_COLS:
                        if feature_name.startswith(cat_col + '_'):
                            original_feature = cat_col
                            break
                    
                    top_features.append({
                        "feature": original_feature,
                        "encoded_feature": feature_name,
                        "mean_abs_shap": float(mean_shap_by_feature[idx])
                    })
                
                cluster_insights.append({
                    "cluster_id": int(cluster_id) if isinstance(cluster_id, (np.integer, int)) else str(cluster_id),
                    "customer_count": customer_count,
                    "avg_churn_probability": avg_churn_prob,
                    "median_churn_probability": median_churn_prob,
                    "high_risk_count": high_risk_count,
                    "high_risk_percentage": float(high_risk_count / customer_count * 100) if customer_count > 0 else 0,
                    "top_features": top_features
                })
            
            # Sort by avg churn probability
            cluster_insights.sort(key=lambda x: x['avg_churn_probability'], reverse=True)
            regional_data[cluster_col] = cluster_insights
        
        # Overall statistics
        overall_stats = {
            "total_customers_analyzed": sample_size,
            "overall_avg_churn_prob": float(np.mean(predictions)),
            "overall_high_risk_count": int(np.sum(predictions > 0.5)),
            "overall_high_risk_percentage": float(np.sum(predictions > 0.5) / sample_size * 100)
        }
        
        return jsonify({
            "success": True,
            "overall_statistics": overall_stats,
            "regional_insights": regional_data,
            "analysis_timestamp": pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error generating regional insights: {str(e)}"
        }), 500

if __name__ == '__main__':
    initialize_analyzer()
    print("\n🚀 Starting Flask API server on http://localhost:5000")
    print("📋 Available endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/customer/<customer_id>")
    print("   POST /api/analyze")
    print("   POST /api/predict")
    app.run(debug=True, port=5000, host='0.0.0.0')
