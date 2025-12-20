import React from 'react';
import { ChurnPrediction, ShapFeatureContribution } from '../types';
import { ShapPlot } from './ShapPlot';
import { LoaderIcon } from './icons/LoaderIcon';

interface MainContentProps {
  prediction: ChurnPrediction | null;
  shapExplanation: ShapFeatureContribution[];
  isLoading: boolean;
  hasAnalyzed: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({ prediction, shapExplanation, isLoading, hasAnalyzed }) => {

  const probabilityColor = prediction && prediction.probability > 60 ? 'text-red-500 dark:text-red-400' :
                           prediction && prediction.probability > 40 ? 'text-yellow-500 dark:text-yellow-400' :
                           'text-green-500 dark:text-green-400';
  
  const decisionColor = prediction?.decision === 'Likely to Churn' 
    ? 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300' 
    : 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <LoaderIcon className="h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Running GBM Model & SHAP Explainer...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing customer profile to predict churn probability.</p>
        </div>
      );
    }

    if (!hasAnalyzed) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-500 h-full p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-200">Ready to Analyze</h2>
                <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
                    Use the controls on the left to input customer data. Click "Analyze Churn Risk" to see the prediction and a breakdown of the contributing factors.
                </p>
            </div>
        );
    }
    
    if (prediction) {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-300/50 dark:border-gray-700/50 flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Churn Probability</h3>
              <p className={`text-6xl font-bold mt-2 ${probabilityColor}`}>{prediction.probability}%</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-300/50 dark:border-gray-700/50 flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prediction</h3>
              <p className={`mt-2 px-4 py-2 text-lg font-semibold rounded-full ${decisionColor}`}>{prediction.decision}</p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-300/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Prediction Explanation (SHAP Values)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">These features are the primary drivers for the model's prediction.</p>
            <div className="mt-4 h-96">
                <ShapPlot data={shapExplanation} />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };


  return (
    <main className="p-6 lg:p-8 bg-transparent">
      <div className="max-w-4xl mx-auto h-full">
        {renderContent()}
      </div>
    </main>
  );
};