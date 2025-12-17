import { UserData, ChurnPrediction, ShapFeatureContribution } from '../types';

// Flask API configuration
const API_BASE_URL = 'http://localhost:5000/api';

let cachedData: any[] | null = null;
let cachedHeaders: string[] | null = null;

const headerMapping: Record<string, keyof UserData> = {
    individual_id: 'individual_id',
    curr_ann_amt: 'current_annual_amount',
    days_tenure: 'days_tenure',
    age_in_years: 'age_in_years',
    date_of_birth: 'date_of_birth',
    latitude: 'latitude',
    longitude: 'longitude',
    city: 'city',
    state: 'state',
    county: 'county',
    income: 'income',
    has_children: 'has_children',
    length_of_residence: 'length_of_residence',
    marital_status: 'marital_status',
    home_market_value: 'home_market_value',
    home_owner: 'home_owner',
    college_degree: 'college_degree',
    good_credit: 'good_credit',
    customer_origination_date: 'customer_origination_date',
    account_suspension_date: 'account_suspension_date',
};

const parseCSV = (text: string): { headers: string[], data: any[] } => {
    const lines = text.trim().split('\n');
    const rawHeaders = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const entry = rawHeaders.reduce((obj: Record<string, any>, rawHeader, index) => {
            const value = values[index]?.trim();
            if (value === undefined || value === '') return obj;

            const mappedHeader = headerMapping[rawHeader] as keyof UserData;
            const targetHeader = mappedHeader || rawHeader;

            const numFields: (keyof UserData)[] = ['current_annual_amount', 'days_tenure', 'age_in_years', 'latitude', 'longitude', 'income', 'length_of_residence', 'home_market_value'];
            const boolFields: (keyof UserData)[] = ['has_children', 'home_owner', 'college_degree', 'good_credit'];

            if (mappedHeader && numFields.includes(mappedHeader)) {
                obj[targetHeader] = parseFloat(value);
            } else if (mappedHeader && boolFields.includes(mappedHeader)) {
                obj[targetHeader] = parseFloat(value) === 1.0;
            } else if (rawHeader === 'predicted_churn_probability') {
                // Store the predicted churn probability from the dataset
                obj[rawHeader] = parseFloat(value);
            } else if (rawHeader === 'individual_id') {
                // Keep individual_id as string
                obj[targetHeader] = value;
            } else {
                obj[targetHeader] = value;
            }

            return obj;
        }, {});
        return entry;
    });
    
    return { headers: rawHeaders, data };
};

const fetchAndCacheData = async (): Promise<{ headers: string[], data: any[] }> => {
    if (cachedData && cachedHeaders) {
        return { headers: cachedHeaders, data: cachedData };
    }
    const response = await fetch('/company_data.csv');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const text = await response.text();
    const { headers, data } = parseCSV(text);
    cachedHeaders = headers;
    cachedData = data;
    return { headers, data };
};


export const findCustomerById = async (id: string): Promise<{ userData: UserData; churnPrediction: ChurnPrediction; } | null> => {
    const { data } = await fetchAndCacheData();
    
    // Search for customer by individual_id (handle both string and number formats)
    const customerRow = data.find(row => {
        const rowId = String(row.individual_id).trim();
        const searchId = id.trim();
        return rowId === searchId || rowId === searchId.replace(/^C-/, '');
    });

    if (!customerRow) {
        return null;
    }
    
    // Try to get real SHAP analysis from Flask API
    let churnProbability = customerRow['predicted_churn_probability'] || 0.5;
    
    try {
        const shapResponse = await fetch(`${API_BASE_URL}/shap/${customerRow.individual_id}`);
        if (shapResponse.ok) {
            const shapData = await shapResponse.json();
            // Use the real churn probability from the SHAP analysis
            churnProbability = shapData.churn_probability;
            console.log('✅ Real SHAP data loaded from Flask API');
        } else {
            console.warn('⚠️ Flask API not available, using CSV predicted probability');
        }
    } catch (error) {
        console.warn('⚠️ Could not connect to Flask API:', error);
        console.log('Using predicted probability from CSV file');
    }

    const userData: UserData = { 
        individual_id: String(customerRow.individual_id),
        current_annual_amount: customerRow.current_annual_amount || 0,
        days_tenure: customerRow.days_tenure || 0,
        age_in_years: customerRow.age_in_years || 0,
        date_of_birth: customerRow.date_of_birth || '',
        latitude: customerRow.latitude || 0,
        longitude: customerRow.longitude || 0,
        city: customerRow.city || '',
        state: customerRow.state || '',
        county: customerRow.county || '',
        income: customerRow.income || 0,
        has_children: customerRow.has_children || false,
        length_of_residence: customerRow.length_of_residence || 0,
        marital_status: customerRow.marital_status || 'Single',
        home_market_value: customerRow.home_market_value || 0,
        home_owner: customerRow.home_owner || false,
        college_degree: customerRow.college_degree || false,
        good_credit: customerRow.good_credit || false,
        customer_origination_date: customerRow.customer_origination_date || '',
        account_suspension_date: customerRow.account_suspension_date || '',
    };

    const churnPrediction: ChurnPrediction = {
        probability: Math.round(churnProbability * 100),
        decision: churnProbability > 0.5 ? 'Likely to Churn' : 'Unlikely to Churn',
    };
    
    return { userData, churnPrediction };
};

export const predictChurnFromData = async (data: UserData): Promise<ChurnPrediction> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let probability = 0.5; // Base probability

    // Tenure: lower is worse
    probability += (1 - data.days_tenure / 5000) * 0.2;
    // Income: lower is worse
    probability += (1 - data.income / 150000) * 0.15;
    // Good credit: not having it is worse
    probability += data.good_credit ? -0.15 : 0.15;
     // Home owner: not owning is worse
    probability += data.home_owner ? -0.1 : 0.1;
    
    // Clamp probability between 0.05 and 0.95
    probability = Math.max(0.05, Math.min(0.95, probability));

    return {
      probability: Math.round(probability * 100),
      decision: probability > 0.5 ? 'Likely to Churn' : 'Unlikely to Churn',
    };
};

/**
 * Simulate customer changes - calls Flask API with modified customer data
 * Returns both prediction and SHAP analysis in real-time
 */
export const simulateCustomerChanges = async (
    modifiedData: UserData
): Promise<{ prediction: ChurnPrediction; shapExplanation: ShapFeatureContribution[] }> => {
    try {
        // Convert UserData to API format (match backend column names)
        const apiData = {
            individual_id: modifiedData.individual_id,
            curr_ann_amt: modifiedData.current_annual_amount,
            days_tenure: modifiedData.days_tenure,
            age_in_years: modifiedData.age_in_years,
            date_of_birth: modifiedData.date_of_birth,
            latitude: modifiedData.latitude,
            longitude: modifiedData.longitude,
            city: modifiedData.city,
            state: modifiedData.state,
            county: modifiedData.county,
            income: modifiedData.income,
            has_children: modifiedData.has_children ? 1 : 0,
            length_of_residence: modifiedData.length_of_residence,
            marital_status: modifiedData.marital_status,
            home_market_value: modifiedData.home_market_value,
            home_owner: modifiedData.home_owner ? 1 : 0,
            college_degree: modifiedData.college_degree ? 1 : 0,
            good_credit: modifiedData.good_credit ? 1 : 0,
            cust_orig_date: modifiedData.customer_origination_date,
            acct_suspd_date: modifiedData.account_suspension_date,
        };

        const response = await fetch(`${API_BASE_URL}/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
        });

        if (!response.ok) {
            throw new Error('Simulation API request failed');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Simulation failed');
        }

        // Parse prediction from API response
        const prediction: ChurnPrediction = {
            probability: Math.round(result.prediction.churn_probability * 100),
            decision: result.prediction.will_churn ? 'Likely to Churn' : 'Unlikely to Churn',
        };

        // Parse SHAP values from API response
        const shapExplanation: ShapFeatureContribution[] = result.shap_analysis.aggregated_features
            .slice(0, 10)
            .map((item: any) => ({
                feature: formatFeatureName(item.feature),
                userValue: getUserFeatureValue(item.feature, modifiedData),
                value: parseFloat((item.total_shap_value * 100).toFixed(2)),
            }));

        console.log('✅ Real-time simulation analysis from Flask API');
        return { prediction, shapExplanation };

    } catch (error) {
        console.warn('⚠️ Simulation API failed, using fallback calculation:', error);
        
        // Fallback to local prediction if API fails
        const prediction = await predictChurnFromData(modifiedData);
        const shapExplanation = await explainPrediction(modifiedData, prediction.probability);
        
        return { prediction, shapExplanation };
    }
};

// Real SHAP Explainer - calls Flask API
export const explainPrediction = async (data: UserData, probability: number): Promise<ShapFeatureContribution[]> => {
  try {
    // Try to get real SHAP values from Flask API
    const response = await fetch(`${API_BASE_URL}/shap/${data.individual_id}`);
    
    if (response.ok) {
      const shapData = await response.json();
      
      // Convert SHAP API response to frontend format
      const contributions: ShapFeatureContribution[] = shapData.shap_values
        .slice(0, 10) // Top 10 features
        .map((item: any) => ({
          feature: formatFeatureName(item.feature),
          userValue: getUserFeatureValue(item.feature, data),
          value: parseFloat((item.shap_value * 100).toFixed(2)) // Scale to percentage
        }));
      
      console.log('✅ Real SHAP explanations loaded from Flask API');
      return contributions;
    } else {
      console.warn('⚠️ Flask API returned error, using fallback SHAP values');
      return getFallbackShapValues(data, probability);
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to Flask API for SHAP values:', error);
    console.log('Using fallback SHAP calculation');
    return getFallbackShapValues(data, probability);
  }
};

// Helper to format feature names from encoded columns
const formatFeatureName = (feature: string): string => {
  // Handle one-hot encoded features
  if (feature.includes('_')) {
    const parts = feature.split('_');
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  return feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, ' ');
};

// Helper to get user's value for a feature
const getUserFeatureValue = (feature: string, data: UserData): string | number | boolean => {
  const fieldMap: Record<string, keyof UserData> = {
    'days_tenure': 'days_tenure',
    'income': 'income',
    'age_in_years': 'age_in_years',
    'curr_ann_amt': 'current_annual_amount',
    'good_credit': 'good_credit',
    'home_owner': 'home_owner',
    'college_degree': 'college_degree',
    'has_children': 'has_children',
    'home_market_value': 'home_market_value',
    'length_of_residence': 'length_of_residence',
  };
  
  // Find matching field
  for (const [key, value] of Object.entries(fieldMap)) {
    if (feature.toLowerCase().includes(key)) {
      const fieldValue = data[value];
      if (typeof fieldValue === 'number' && key === 'income') {
        return `$${fieldValue.toLocaleString()}`;
      }
      if (typeof fieldValue === 'boolean') {
        return fieldValue ? 'Yes' : 'No';
      }
      return fieldValue;
    }
  }
  
  return 'N/A';
};

// Fallback SHAP calculation (used when Flask API is unavailable)
const getFallbackShapValues = (data: UserData, probability: number): ShapFeatureContribution[] => {
  const contributions: ShapFeatureContribution[] = [];
  const baseValue = 50;

  const addContribution = (feature: string, userValue: string | number | boolean, effect: number) => {
      contributions.push({ feature, userValue, value: effect });
  };
  
  // ...existing mock SHAP logic...
  const tenureEffect = (730 - data.days_tenure) / 100;
  if (data.days_tenure < 730) addContribution('Tenure (days)', data.days_tenure, tenureEffect > 0 ? tenureEffect : 0);
  else addContribution('Tenure (days)', data.days_tenure, -((data.days_tenure - 730) / 200));

  const incomeEffect = (data.income - 75000) / 10000;
  addContribution('Income', `$${data.income.toLocaleString()}`, incomeEffect);

  addContribution('Good Credit', data.good_credit ? 'Yes' : 'No', data.good_credit ? -10 : 15);
  addContribution('Home Owner', data.home_owner ? 'Yes' : 'No', data.home_owner ? -7 : 5);

  const ageEffect = (data.age_in_years - 30) * 0.2;
  addContribution('Age', data.age_in_years, ageEffect);

  const totalEffect = contributions.reduce((sum, c) => sum + c.value, 0);
  const scaleFactor = (probability - baseValue) / (totalEffect || 1);
  
  const finalContributions = contributions.map(c => ({...c, value: parseFloat((c.value * scaleFactor).toFixed(2))}));

  return finalContributions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 7);
};