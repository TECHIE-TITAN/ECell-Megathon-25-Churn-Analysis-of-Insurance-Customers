import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import shap
import joblib
import os
import re
import json

# --- 1. Configuration: Define your file paths and settings ---

# TODO: Update these paths and lists to match your project
MODEL_FILENAME = 'churn_model.pkl'
DATA_FILENAME = 'X_test.csv'  # This can be 'output2.csv' or any other data file

# This list is CRUCIAL. It must contain all columns that need one-hot encoding.
CATEGORICAL_COLS = [
    'city',
    'marital_status',
    'acct_suspd_date',
    'cust_orig_date',
    'state',
    'county',
    'home_market_value'
]

# Columns that are identifiers, not features for the model
IDENTIFIER_COLS = ['individual_id', 'address_id']


# --- 2. The SHAP Simulation Engine Class ---

class ShapDashboardSimulator:
    """
    Handles real-time SHAP value lookups and "what-if" simulations for a dashboard.
    """
    def __init__(self, model, explainer, X_test_original, X_features_aligned, precalculated_shap_values):
        self.model = model
        self.explainer = explainer
        self.X_test_original = X_test_original
        self.X_features_aligned = X_features_aligned
        self.precalculated_shap_values = precalculated_shap_values
        
        # Create a fast lookup map from ID to index
        self.id_to_index_map = pd.Series(self.X_test_original.index, index=self.X_test_original.individual_id).to_dict()
        print("✅ SHAP Simulator Initialized and Ready.")

    def _get_shap_data_as_json(self, shap_values_row, feature_names):
        """Helper to format SHAP data into a clean JSON."""
        shap_data = [{"feature": feature, "shap_value": value} for feature, value in zip(feature_names, shap_values_row)]
        return json.dumps(shap_data, indent=2)

    def get_original_shap(self, customer_id):
        """Retrieves pre-calculated SHAP values for a given customer ID."""
        if customer_id not in self.id_to_index_map:
            return json.dumps({"error": f"Customer ID {customer_id} not found."})
        
        index = self.id_to_index_map[customer_id]
        shap_values_row = self.precalculated_shap_values[index]
        feature_names = self.X_features_aligned.columns
        
        print(f"\nRetrieving original SHAP values for customer {customer_id}...")
        return self._get_shap_data_as_json(shap_values_row, feature_names)

    def simulate_shap(self, customer_id, simulation_features):
        """Simulates SHAP values for a customer by modifying their features."""
        if customer_id not in self.id_to_index_map:
            return json.dumps({"error": f"Customer ID {customer_id} not found."})

        index = self.id_to_index_map[customer_id]
        
        # Create a "digital twin" and apply changes
        original_customer_data = self.X_test_original.loc[index].to_dict()
        simulated_customer = original_customer_data.copy()
        print(f"\nSimulating changes for customer {customer_id}: {simulation_features}")
        simulated_customer.update(simulation_features)
        
        # Re-preprocess this single customer
        simulated_df = pd.DataFrame([simulated_customer])
        simulated_df_encoded = pd.get_dummies(simulated_df, columns=CATEGORICAL_COLS)
        
        # Align to the model's blueprint
        simulated_df_aligned = simulated_df_encoded.reindex(columns=self.model.get_booster().feature_names, fill_value=0)
        
        # Recalculate SHAP values in real-time
        new_shap_values = self.explainer.shap_values(simulated_df_aligned)
        
        return self._get_shap_data_as_json(new_shap_values[0], simulated_df_aligned.columns)


# --- 3. Main execution block ---

if __name__ == "__main__":
    # STEP 1: Load Model and Data
    print("--- Step 1: Loading Model and Data ---")
    try:
        model = joblib.load(MODEL_FILENAME)
        X_test = pd.read_csv(DATA_FILENAME)
        print(f"✅ Model '{MODEL_FILENAME}' and data '{DATA_FILENAME}' loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ Error: Could not find a required file. {e}")
        exit()

    # STEP 2: Preprocess and Align Data
    print("\n--- Step 2: Preprocessing and Aligning Data ---")
    X_features = X_test.drop(columns=IDENTIFIER_COLS)
    X_features_encoded = pd.get_dummies(X_features, columns=CATEGORICAL_COLS)
    model_feature_names = model.get_booster().feature_names
    X_features_aligned = X_features_encoded.reindex(columns=model_feature_names, fill_value=0)
    print("✅ Data preprocessed and aligned with the model.")

    # STEP 3: Run Core SHAP Analysis
    print("\n--- Step 3: Calculating SHAP Values ---")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_features_aligned)
    print("✅ SHAP analysis complete.")

    # STEP 4: Generate and Save Aggregated Feature Importance Plot
    print("\n--- Step 4: Generating Aggregated Importance Plot ---")
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    feature_importance = pd.DataFrame(list(zip(X_features_aligned.columns, mean_abs_shap)), columns=['feature_name', 'shap_importance'])
    
    feature_map = {col: next((cat_col for cat_col in CATEGORICAL_COLS if col.startswith(cat_col)), col) for col in feature_importance['feature_name']}
    feature_importance['original_feature'] = feature_importance['feature_name'].map(feature_map)
    aggregated_importance = feature_importance.groupby('original_feature')['shap_importance'].sum().sort_values(ascending=False)

    plt.figure(figsize=(10, 8))
    aggregated_importance.head(20).plot(kind='barh', color='cornflowerblue')
    plt.gca().invert_yaxis()
    plt.title('Top 20 Aggregated Feature Importances')
    plt.xlabel('Total SHAP Impact on Prediction')
    plt.ylabel('Original Feature')
    plt.tight_layout()
    plt.savefig('aggregated_importance_plot.png')
    plt.close()
    print("✅ Aggregated importance plot saved as 'aggregated_importance_plot.png'.")

    # STEP 5: Initialize and Use the Simulator
    print("\n--- Step 5: Initializing and Testing the Simulator ---")
    simulator = ShapDashboardSimulator(model, explainer, X_test, X_features_aligned, shap_values)
    
    # Example 1: Get original SHAP data for the first customer
    customer_id_to_check = X_test['individual_id'].iloc[0]
    original_data = simulator.get_original_shap(customer_id_to_check)
    print("\n--- Original SHAP Data (JSON for Dashboard) ---")
    print(original_data)

    # Example 2: Run a "what-if" simulation
    simulation_changes = {'days_tenure': 50, 'marital_status': 'M'}
    simulated_data = simulator.simulate_shap(customer_id_to_check, simulation_changes)
    print("\n--- Simulated SHAP Data (JSON for Dashboard) ---")
    print(simulated_data)