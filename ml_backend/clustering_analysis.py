#!/usr/bin/env python3
"""
Auto Insurance Churn Data - K-Clustering Analysis
This script performs k-means clustering analysis on auto insurance customer data
as described in the Clustering_Analysis_Report.md
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score
import pickle
import os
from datetime import datetime
import argparse
import warnings
warnings.filterwarnings('ignore')

class InsuranceClusteringAnalysis:
    def __init__(self, data_path):
        """Initialize the clustering analysis with data path"""
        self.data_path = data_path
        self.original_data = None
        self.cleaned_data = None
        self.sample_data = None
        self.feature_groups = {}
        self.scalers = {}
        self.cluster_models = {}
        self.label_encoders = {}
        # Features that must never be used for clustering (to avoid leakage/bias)
        self.excluded_features = {"churn"}
        
    def load_and_clean_data(self, sample_size=37500):
        """Load and clean the insurance data"""
        print("Loading dataset...")
        
        # Load the data (assuming it's large, we'll handle it carefully)
        try:
            # Load the entire dataset or a larger sample to get 37,500 points
            self.original_data = pd.read_csv(self.data_path)
            print(f"Loaded {len(self.original_data)} rows from dataset")
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
            
        print("Cleaning data...")
        
        # Make a copy for cleaning
        df = self.original_data.copy()
        
        # Remove columns as mentioned in the report
        columns_to_remove = [
            'individual_id', 'address_id', 'cust_orig_date', 
            'acct_suspd_date', 'length_of_residence'
        ]
        
        # Remove columns that exist in the dataset
        existing_cols_to_remove = [col for col in columns_to_remove if col in df.columns]
        if existing_cols_to_remove:
            df = df.drop(columns=existing_cols_to_remove)
            print(f"Removed columns: {existing_cols_to_remove}")
        
        # Handle missing values
        print("Handling missing values...")
        for column in df.columns:
            if df[column].dtype in ['int64', 'float64']:
                df[column].fillna(df[column].median(), inplace=True)
            else:
                df[column].fillna(df[column].mode()[0] if not df[column].mode().empty else 'Unknown', inplace=True)
        
        # Encode categorical variables
        print("Encoding categorical variables...")
        categorical_columns = df.select_dtypes(include=['object']).columns
        
        for column in categorical_columns:
            if column not in ['Churn']:  # Don't encode target if it's string
                le = LabelEncoder()
                df[column] = le.fit_transform(df[column].astype(str))
                self.label_encoders[column] = le
        
        # Take the first N rows for clustering analysis (deterministic order),
        # or use full dataset if sample_size is None/0 or >= dataset size.
        if sample_size and sample_size > 0 and len(df) > sample_size:
            df = df.head(sample_size)
            print(f"Took first {sample_size} rows for analysis")
        else:
            print("Using full dataset for analysis")
        
        self.cleaned_data = df
        self.sample_data = df.copy()
        
        print(f"Final dataset shape: {df.shape}")
        print(f"Features: {list(df.columns)}")
        
        return True
    
    def define_feature_groups(self):
        """Automatically define feature groups based on available columns"""
        available_columns = set(self.sample_data.columns)
        
        # Define potential feature groups with flexible column matching
        potential_groups = {
            'Demographics': [
                'age_in_years', 'age', 'has_children', 'children', 'marital_status', 
                'marital', 'college_degree', 'education', 'good_credit', 'credit'
            ],
            'Financial': [
                'curr_ann_amt', 'annual_premium', 'premium', 'income', 'salary',
                'home_market_value', 'home_value', 'property_value'
            ],
            'Geographic': [
                'latitude', 'longitude', 'city', 'state', 'county', 'zip', 'zipcode',
                'region', 'location'
            ],
            'Policy_Behavioral': [
                'days_tenure', 'tenure', 'policy_tenure', 'date_of_birth', 'dob',
                'home_owner', 'homeowner', 'owns_home'
            ]
        }
        
        # Match available columns to feature groups
        self.feature_groups = {}
        for group_name, potential_features in potential_groups.items():
            matched_features = []
            for feature in potential_features:
                if feature in available_columns:
                    matched_features.append(feature)

            # Strictly exclude target/leakage features like 'Churn' from any group
            matched_features = [f for f in matched_features if f.lower() not in self.excluded_features]
            
            if matched_features:  # Only add groups that have at least one feature
                self.feature_groups[group_name] = matched_features
        
        print("Feature groups automatically defined:")
        for group, features in self.feature_groups.items():
            print(f"  {group}: {features}")
        
        # If no standard groups found, create groups based on data types
        if not self.feature_groups:
            print("No standard feature groups found. Creating groups based on data types...")
            numeric_cols = self.sample_data.select_dtypes(include=[np.number]).columns.tolist()
            categorical_cols = self.sample_data.select_dtypes(include=['object']).columns.tolist()
            
            if numeric_cols:
                # Split numeric columns into groups
                mid_point = len(numeric_cols) // 2
                self.feature_groups['Numeric_Group_1'] = numeric_cols[:mid_point]
                if len(numeric_cols) > mid_point:
                    self.feature_groups['Numeric_Group_2'] = numeric_cols[mid_point:]
            
            if categorical_cols:
                self.feature_groups['Categorical_Group'] = categorical_cols
            
            print("Data-type based groups created:")
            for group, features in self.feature_groups.items():
                print(f"  {group}: {features}")
    
    def find_optimal_clusters(self, data, max_clusters=10):
        """Find optimal number of clusters using elbow method"""
        inertias = []
        k_range = range(2, max_clusters + 1)
        
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(data)
            inertias.append(kmeans.inertia_)
        
        # Simple elbow method - look for the point where the decrease in inertia slows down
        # For this implementation, we'll use the predetermined optimal numbers from the report
        return inertias
    
    def perform_clustering(self):
        """Perform k-means clustering on each feature group"""
        
        # Optimal cluster numbers from the report (with fallback for other groups)
        optimal_clusters = {
            'Demographics': 7,
            'Financial': 6,
            'Geographic': 4,
            'Policy_Behavioral': 5,
            'Numeric_Group_1': 5,
            'Numeric_Group_2': 4,
            'Categorical_Group': 3
        }
        
        print("Performing clustering analysis...")
        
        for group_name, features in self.feature_groups.items():
            if not features:
                continue
                
            print(f"\nProcessing {group_name} cluster...")
            
            # Extract features for this group, ensuring excluded features are not used
            effective_features = [f for f in features if f.lower() not in self.excluded_features]
            if len(effective_features) != len(features):
                removed = set(features) - set(effective_features)
                if removed:
                    print(f"  Excluding non-allowed features from clustering (to avoid leakage): {sorted(list(removed))}")
            if not effective_features:
                print("  No valid features left after exclusion; skipping this group.")
                continue

            group_data = self.sample_data[effective_features].copy()
            
            # Handle any remaining missing values
            group_data = group_data.fillna(group_data.median() if group_data.select_dtypes(include=[np.number]).shape[1] > 0 else 0)
            
            # Scale the features
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(group_data)
            self.scalers[group_name] = scaler
            
            # Perform clustering with optimal number or default to 5
            n_clusters = optimal_clusters.get(group_name, 5)
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(scaled_data)
            
            # Store the model
            self.cluster_models[group_name] = kmeans
            
            # Add cluster labels to the main dataset
            cluster_column = f"{group_name}_Cluster"
            self.sample_data[cluster_column] = cluster_labels
            
            # Print cluster distribution
            cluster_dist = pd.Series(cluster_labels).value_counts().sort_index()
            print(f"  Cluster distribution:")
            for cluster_id, count in cluster_dist.items():
                percentage = (count / len(cluster_labels)) * 100
                print(f"    Cluster {cluster_id}: {count} ({percentage:.1f}%)")
    
    def generate_insights(self):
        """Generate business insights from clustering results"""
        print("\n" + "="*50)
        print("CLUSTERING ANALYSIS INSIGHTS")
        print("="*50)
        
        cluster_columns = [col for col in self.sample_data.columns if col.endswith('_Cluster')]
        
        for cluster_col in cluster_columns:
            group_name = cluster_col.replace('_Cluster', '')
            print(f"\n{group_name} Clustering Insights:")
            
            # Get cluster value counts
            cluster_counts = self.sample_data[cluster_col].value_counts().sort_index()
            
            for cluster_id in cluster_counts.index:
                cluster_data = self.sample_data[self.sample_data[cluster_col] == cluster_id]
                count = len(cluster_data)
                percentage = (count / len(self.sample_data)) * 100
                
                print(f"  Cluster {cluster_id}: {count} customers ({percentage:.1f}%)")
                
                # Add some basic statistics for key features
                if group_name == 'Demographics' and 'age_in_years' in cluster_data.columns:
                    avg_age = cluster_data['age_in_years'].mean()
                    print(f"    - Average age: {avg_age:.1f}")
                
                if group_name == 'Financial' and 'income' in cluster_data.columns:
                    avg_income = cluster_data['income'].mean()
                    print(f"    - Average income: ${avg_income:,.0f}")
                
                if group_name == 'Policy_Behavioral' and 'Churn' in cluster_data.columns:
                    churn_rate = cluster_data['Churn'].mean() * 100
                    print(f"    - Churn rate: {churn_rate:.1f}%")
    
    def create_visualizations(self):
        """Create visualization plots for the clustering analysis"""
        print("\nCreating visualizations...")
        
        # Set up the plot
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Auto Insurance Customer Clustering Analysis', fontsize=16, fontweight='bold')
        
        cluster_columns = [col for col in self.sample_data.columns if col.endswith('_Cluster')]
        
        for idx, cluster_col in enumerate(cluster_columns):
            if idx >= 4:  # We only have 4 subplots
                break
                
            ax = axes[idx // 2, idx % 2]
            group_name = cluster_col.replace('_Cluster', '')
            
            # Create a bar plot of cluster distributions
            cluster_counts = self.sample_data[cluster_col].value_counts().sort_index()
            colors = plt.cm.Set3(np.linspace(0, 1, len(cluster_counts)))
            
            bars = ax.bar(cluster_counts.index, cluster_counts.values, color=colors)
            ax.set_title(f'{group_name} Cluster Distribution', fontweight='bold')
            ax.set_xlabel('Cluster ID')
            ax.set_ylabel('Number of Customers')
            
            # Add percentage labels on bars
            total = len(self.sample_data)
            for bar, count in zip(bars, cluster_counts.values):
                percentage = (count / total) * 100
                ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + total*0.01,
                       f'{percentage:.1f}%', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        # Save visualization to project folder on Windows
        vis_path = r'C:\\Users\\Lenovo\\OneDrive\\Desktop\\megathon\\E-Cell-Megathon-25\\clustering_analysis.png'
        plt.savefig(vis_path, dpi=300, bbox_inches='tight')
        print(f"Saved visualization to {vis_path}")

    def save_results(self):
        """Save the clustered dataset and trained models"""
        # Save the clustered dataset to output.csv
        output_path = r'C:\\Users\\Lenovo\\OneDrive\\Desktop\\megathon\\E-Cell-Megathon-25\\for_train_full.csv'
        self.sample_data.to_csv(output_path, index=False)
        print(f"Saved clustered dataset to: {output_path}")

        # Save trained models and scalers as pickle files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        models_dir = r'C:\\Users\\Lenovo\\OneDrive\\Desktop\\megathon\\E-Cell-Megathon-25\\models'
        os.makedirs(models_dir, exist_ok=True)

        # Save all clustering models
        models_path = os.path.join(models_dir, f"clustering_models_{timestamp}.pkl")
        with open(models_path, 'wb') as f:
            pickle.dump({
                'cluster_models': self.cluster_models,
                'scalers': self.scalers,
                'label_encoders': self.label_encoders,
                'feature_groups': self.feature_groups
            }, f)
        print(f"Saved trained models to: {models_path}")

        # Also save with a standard name for easy access
        standard_models_path = os.path.join(models_dir, "clustering_models_latest.pkl")
        with open(standard_models_path, 'wb') as f:
            pickle.dump({
                'cluster_models': self.cluster_models,
                'scalers': self.scalers,
                'label_encoders': self.label_encoders,
                'feature_groups': self.feature_groups
            }, f)
        print(f"Saved latest models to: {standard_models_path}")

        # Print summary
        print(f"\nDataset Summary:")
        print(f"  Total customers analyzed: {len(self.sample_data)}")
        print(f"  Total features: {len(self.sample_data.columns)}")

        cluster_columns = [col for col in self.sample_data.columns if col.endswith('_Cluster')]
        print(f"  Cluster columns added: {cluster_columns}")
        print(f"  Models saved: {len(self.cluster_models)} clustering models")
    
    def run_full_analysis(self):
        """Run the complete clustering analysis pipeline"""
        print("Starting Auto Insurance Clustering Analysis")
        print("=" * 50)
        
        # Step 1: Load and clean data
        if not self.load_and_clean_data():
            print("Failed to load data. Exiting.")
            return False
        
        # Step 2: Define feature groups
        self.define_feature_groups()
        
        # Step 3: Perform clustering
        self.perform_clustering()
        
        # Step 4: Generate insights
        self.generate_insights()
        
        # Step 5: Create visualizations
        self.create_visualizations()
        
        # Step 6: Save results
        self.save_results()
        
        print("\n" + "=" * 50)
        print("Analysis completed successfully!")
        print("=" * 50)
        
        return True

def main():
    """Main function to run the clustering analysis"""
    parser = argparse.ArgumentParser(description="Run clustering analysis on auto insurance data")
    parser.add_argument("--input", default=r'C:\\Users\\Lenovo\\OneDrive\\Desktop\\megathon\\E-Cell-Megathon-25\\csv_files\\autoinsurance_churn.csv', help="Path to input CSV")
    parser.add_argument("--sample-size", type=int, default=37500, help="Number of rows to analyze; use 0 for full file")
    parser.add_argument("--full", action="store_true", help="Analyze entire file (overrides --sample-size)")
    args = parser.parse_args()

    # Resolve sample size
    sample_size = 0 if args.full else args.sample_size

    # Create and run the analysis
    analyzer = InsuranceClusteringAnalysis(args.input)
    # Load/clean with chosen sample size, then proceed
    print("Starting Auto Insurance Clustering Analysis")
    print("=" * 50)
    if not analyzer.load_and_clean_data(sample_size=sample_size):
        print("Failed to load data. Exiting.")
        return analyzer
    analyzer.define_feature_groups()
    analyzer.perform_clustering()
    analyzer.generate_insights()
    analyzer.create_visualizations()
    analyzer.save_results()
    print("\n" + "=" * 50)
    print("Analysis completed successfully!")
    print("=" * 50)
    if True:
        print("\nRecommendations for next steps:")
        print("1. Run the full dataset clustering using apply_full_clustering.py")
        print("2. Validate cluster characteristics across the complete dataset")
        print("3. Implement cluster-based strategies in CRM systems")
        print("4. Monitor business metrics by cluster over time")
    
    return analyzer

if __name__ == "__main__":
    # Run the analysis
    analyzer = main()