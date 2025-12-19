import detective
import pandas as pd
import numpy as np
import xgboost as xgb

# trained tree based model
X_test=pd.DataFrame({
     'age': [34, 56],
    'income': [55000, 95000],
    'policy_tenure_months': [12, 48],
    'customer_segment': [2, 0]
})

model = xgb.XGBClassifier(enable_categorical=True, use_label_encoder=False, eval_metric='logloss')
# A dummy model needs to be fit on some dummy data to work
model.fit(X_test, [0,1])

# ----End of Prerequisite code----


explainer = detective.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)


# visualize the first prediction's explanation (use matplotlib=True to avoid Javascript)
print("Displaying Force Plot for a single customer:")
detective.force_plot(
    explainer.expected_value,
    shap_values[0,:],
    X_test.iloc[0,:]
)


# Red features pushed the prediction higher (towards churn).
# Blue features pushed the prediction lower (away from churn).



# PLOT B: Explain the whole model with a Summary Plot
# This shows the most important features overall and their impact.
print("\nDisplaying Summary Plot for all customers:")
detective.summary_plot(
    shap_values,
    X_test
)
# Features are ranked by importance. The plot shows whether high (red) or low (blue)
# values of a feature push the prediction higher.


# PLOT C: A simpler view with a Bar Chart Summary
# This shows the average importance of each feature.
print("\nDisplaying Bar Chart Summary Plot:")
detective.summary_plot(
    shap_values,
    X_test,
    plot_type="bar"
)
# The longer the bar, the more impact the feature has on the model's predictions.
# Features are ranked by importance.