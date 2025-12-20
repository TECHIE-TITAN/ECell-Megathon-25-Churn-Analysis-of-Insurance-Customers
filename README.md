# Insurance Churn Prediction Application

Customer churn poses a critical challenge for auto insurance companies, resulting in substantial revenue loss and escalating customer acquisition costs. This full-stack ML solution addresses Chubb's challenge by predicting customer churn likelihood using historical data including demographics, income, location, policy tenure, and credit behavior. Our system implements explainable AI through SHAP analysis to provide transparent, actionable insights that enable targeted retention strategies.

## 🎯 What We Achieved

- **Accurate Churn Prediction Model** - XGBoost classifier trained on 200K+ customer records achieving high-precision risk scoring with sub-second inference times
- **Explainable AI Implementation** - SHAP-based feature contribution analysis revealing key churn drivers (tenure, income, credit score) for each prediction
- **Interactive Non-Technical Dashboard** - React-based UI enabling business users to explore individual customer risks, regional trends, and churn factors without ML expertise
- **Scalable Architecture** - Modular design with separate prediction, explainability, and visualization components handling large datasets (192MB+) efficiently
- **Production-Ready Deployment** - Flask REST API with CORS support, CSV batch processing, and real-time analysis capabilities

## 📊 Dataset

- **Source**: Kaggle Auto Insurance Churn Dataset
- **Link**: [https://www.kaggle.com/datasets/merishnasuwal/auto-insurance-churn-analysis-dataset?resource=download&select=autoinsurance_churn.csv]
- **Size**: 200K+ customer records, 192MB
- **Features**: Demographics, income, location, policy tenure, credit behavior, and more

## ✨ Key Features

- **Customer Search & Risk Assessment** - Search individual customers by ID to view comprehensive churn risk profiles with probability scores and demographic insights
- **SHAP Explainability Dashboard** - Interactive waterfall charts and feature contribution visualizations explaining why each customer is at risk
- **Batch CSV Upload & Analysis** - Upload customer datasets for bulk churn predictions with downloadable reports and summary statistics
- **Regional Intelligence Maps** - Geographic heatmaps showing state-wise and county-level churn patterns with aggregated risk metrics
- **Real-Time Predictions** - Sub-second inference for individual customers with live API integration between frontend and ML backend

## 🚀 Quick Setup & Run

### Installation

1. **Setup Python Backend**
   ```bash
   # Create virtual environment
   python3 -m venv .venv
   source .venv/bin/activate  # On Linux/Mac
   
   # Install dependencies
   pip install -r backend/requirements.txt
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   source .venv/bin/activate
   python backend/api/api_server.py
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---