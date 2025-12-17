# Auto Insurance Churn Data - K-Clustering Analysis Report

## Executive Summary

This report presents a comprehensive k-means clustering analysis performed on auto insurance customer data. The analysis identified distinct customer segments across 4 key feature groups, creating a total of 22 clusters that can be used for targeted marketing, risk assessment, and customer retention strategies.

## Dataset Overview

- **Original Dataset**: 1,680,909 customers with 22 features
- **Sample Used for Analysis**: 30,000 customers (for computational efficiency)
- **Final Cleaned Dataset**: 17 features after removing IDs, sparse data, and irrelevant columns

## Data Cleaning Process

### Removed Columns:
- `individual_id`, `address_id` - Customer identifiers
- `cust_orig_date`, `acct_suspd_date` - Date fields with high sparsity

Important note: The target column Churn is strictly excluded from all clustering features to prevent target leakage and bias. Churn is only used downstream for reporting (e.g., churn rate by cluster), not for forming clusters.
- `length_of_residence` - Redundant geographic information
 **Original Dataset**: 1,680,909 customers with 22 features
 **Sample Used for Analysis**: 37,500 customers by default (deterministic first rows for reproducibility). The script also supports analyzing the full dataset with a flag.
- **Missing Values**: Filled numerical columns with median, categorical with mode
- **Categorical Encoding**: Applied Label Encoding to convert text categories to numerical values

Note: `Churn` is the target label and is retained in the dataset for reporting (e.g., churn rate by cluster) but is never used as an input feature for clustering.

The analysis grouped features into 4 logical categories based on business relevance and statistical characteristics:

### 1. Demographics (7 clusters)
**Features**: `age_in_years`, `has_children`, `marital_status`, `college_degree`, `good_credit`

**Cluster Distribution**:
- Cluster 0: 8.3% - Young adults, poor credit
- Cluster 1: 17.1% - Middle-aged, mixed demographics
- Cluster 2: 13.5% - Educated professionals
- Cluster 3: 21.2% - Largest group - mature, stable customers
- Cluster 4: 19.3% - Young families with children
- Cluster 5: 13.4% - Senior customers
- Cluster 6: 7.3% - High-risk demographic
 ### 4. Policy & Behavioral (5 clusters)
 **Features**: `days_tenure`, `date_of_birth`, `home_owner`

Churn is intentionally excluded from this and all other feature groups to prevent target leakage.
**Features**: `curr_ann_amt`, `income`, `home_market_value`

**Cluster Distribution**:
- Cluster 0: 17.2% - Mid-range financial profile
 - **Target Leakage Prevention**: `Churn` is excluded from all clustering features; clusters are formed only from non-target attributes.
- Cluster 4: 6.9% - Premium customers (smallest group)
- Cluster 5: 20.1% - Largest group - budget-conscious customers

 1. **`for_inf_after37.5.csv`**: Sample dataset (37.5K rows by default, or full if requested) with cluster assignments
 2. **`clustering_analysis.png`**: Visualization of cluster analysis and distributions
 3. **`models/clustering_models_<timestamp>.pkl`** and **`models/clustering_models_latest.pkl`**: Pickled scalers, label encoders, feature groups, and clustering models for reuse
**Cluster Distribution**:
- Cluster 0: 15.7% - Urban centers
- Cluster 1: 17.9% - Suburban areas
 1. **Full Dataset Processing**: Re-run `clustering_analysis.py` with `--full` (or set `--sample-size 0`) to cluster all 1.6M customers
 2. **Validation**: Compare cluster characteristics across full dataset
 3. **Business Integration**: Implement cluster-based strategies in CRM and marketing systems
 4. **Performance Monitoring**: Track business metrics by cluster over time
**Features**: `days_tenure`, `date_of_birth`, `home_owner`, `Churn`

**Cluster Distribution**:
- Cluster 0: 31.3% - Largest group - long-term customers
- Cluster 1: 15.6% - New customers
- Cluster 2: 15.3% - Mid-tenure customers
- Cluster 3: 11.9% - High-risk churn group
- Cluster 4: 25.9% - Homeowners with stable tenure

## Key Business Insights

### Customer Segmentation Insights:

1. **High-Value Retention Focus**: 
   - Financial Cluster 4 (6.9%) represents premium customers requiring special attention
   - Demographics Cluster 3 (21.2%) shows the most stable customer base

2. **Churn Risk Management**:
   - Policy_Behavioral Cluster 3 (11.9%) likely contains high-churn risk customers
   - Demographics Cluster 6 (7.3%) represents high-risk demographic segment

3. **Geographic Market Opportunities**:
   - Geographic Clusters 2 & 3 (66.4% combined) represent major market concentrations
   - Targeted regional campaigns can be designed for specific geographic clusters

4. **Financial Product Alignment**:
   - Financial Cluster 5 (20.1%) represents budget-conscious customers needing affordable options
   - Financial Cluster 4 (6.9%) represents premium segment for upselling opportunities

## Technical Methodology

### Clustering Algorithm: K-Means
- **Cluster Selection**: Elbow method with inertia optimization
- **Preprocessing**: StandardScaler normalization
- **Validation**: Silhouette analysis (limited due to dataset size)

### Optimal Cluster Numbers:
- Demographics: 7 clusters
- Financial: 6 clusters  
- Geographic: 4 clusters
- Policy_Behavioral: 5 clusters

## Output Files Generated

1. **`autoinsurance_clustered.csv`**: Sample dataset (30K rows) with cluster assignments
2. **`clustering_analysis.png`**: Visualization of cluster analysis and distributions
3. **`apply_full_clustering.py`**: Script to apply clustering to full 1.6M dataset

## Cluster Columns Added

The analysis adds 4 new cluster identification columns to the original dataset:
- `Demographics_Cluster`: Values 0-6
- `Financial_Cluster`: Values 0-5
- `Geographic_Cluster`: Values 0-3
- `Policy_Behavioral_Cluster`: Values 0-4

## Recommendations for Business Use

### Marketing Strategy:
1. **Targeted Campaigns**: Use demographic clusters for age/lifestyle-specific messaging
2. **Geographic Optimization**: Focus marketing spend on Geographic Clusters 2 & 3
3. **Product Positioning**: Align offerings with Financial cluster characteristics

### Risk Management:
1. **Churn Prevention**: Monitor Policy_Behavioral Cluster 3 for retention campaigns
2. **Credit Risk**: Use Demographics Cluster 6 for enhanced underwriting
3. **Premium Optimization**: Adjust pricing strategies by Financial clusters

### Customer Service:
1. **Service Levels**: Premium service for Financial Cluster 4
2. **Communication Preferences**: Tailor by demographic characteristics
3. **Retention Programs**: Design cluster-specific loyalty programs

## Next Steps

1. **Full Dataset Processing**: Run `apply_full_clustering.py` to cluster all 1.6M customers
2. **Validation**: Compare cluster characteristics across full dataset
3. **Business Integration**: Implement cluster-based strategies in CRM and marketing systems
4. **Performance Monitoring**: Track business metrics by cluster over time

## Technical Notes

- **Computational Efficiency**: Analysis used 30K sample due to dataset size (1.6M rows)
- **Scalability**: Clustering models can be applied to full dataset using provided scripts
- **Reproducibility**: All analyses use `random_state=42` for consistent results
- **Memory Management**: Full dataset processing uses chunked approach to handle memory constraints

---

*Analysis completed on October 11, 2025*
*Tools Used: Python 3.12, scikit-learn, pandas, numpy, matplotlib*