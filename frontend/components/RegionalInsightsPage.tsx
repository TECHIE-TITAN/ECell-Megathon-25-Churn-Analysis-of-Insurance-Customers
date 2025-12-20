import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { LoaderIcon } from './icons/LoaderIcon';

interface TopFeature {
  feature: string;
  encoded_feature: string;
  mean_abs_shap: number;
}

interface ClusterInsight {
  cluster_id: number | string;
  customer_count: number;
  avg_churn_probability: number;
  median_churn_probability: number;
  high_risk_count: number;
  high_risk_percentage: number;
  top_features: TopFeature[];
}

interface OverallStats {
  total_customers_analyzed: number;
  overall_avg_churn_prob: number;
  overall_high_risk_count: number;
  overall_high_risk_percentage: number;
}

interface RegionalInsightsData {
  success: boolean;
  overall_statistics: OverallStats;
  regional_insights: {
    [key: string]: ClusterInsight[];
  };
  analysis_timestamp: string;
  error?: string;
}

export const RegionalInsightsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegionalInsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Geographic_Cluster');

  const fetchRegionalInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/regional-insights');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch regional insights');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = data?.regional_insights ? Object.keys(data.regional_insights) : [];

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatProbability = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Regional Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze churn patterns across different customer segments and regions
          </p>
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            onClick={fetchRegionalInsights}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoaderIcon className="animate-spin" />
                Generating Insights...
              </>
            ) : (
              'Generate Regional Insights'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Results Display */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Overall Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.overall_statistics.total_customers_analyzed.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Churn Probability</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatProbability(data.overall_statistics.overall_avg_churn_prob)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Risk Customers</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {data.overall_statistics.overall_high_risk_count.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Risk %</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatPercentage(data.overall_statistics.overall_high_risk_percentage)}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Cluster Insights */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedCategory.replace(/_/g, ' ')} Analysis
                </h3>
                
                {data.regional_insights[selectedCategory]?.map((cluster) => (
                  <div
                    key={cluster.cluster_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Cluster {cluster.cluster_id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cluster.customer_count.toLocaleString()} customers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Churn Risk</p>
                        <p className={`text-2xl font-bold ${
                          cluster.avg_churn_probability > 0.5
                            ? 'text-red-600 dark:text-red-400'
                            : cluster.avg_churn_probability > 0.3
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {formatProbability(cluster.avg_churn_probability)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Median Churn Risk</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatProbability(cluster.median_churn_probability)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">High Risk Count</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cluster.high_risk_count.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">High Risk %</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPercentage(cluster.high_risk_percentage)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Top Contributing Features:
                      </p>
                      <div className="space-y-2">
                        {cluster.top_features.slice(0, 5).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {feature.feature}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {feature.mean_abs_shap.toFixed(4)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (feature.mean_abs_shap / cluster.top_features[0].mean_abs_shap) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Analysis generated at: {new Date(data.analysis_timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
