import React from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { Button } from './ui/Button';

interface ModeSelectionProps {
  onSelectSearch: () => void;
  onSelectRegional: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectSearch, onSelectRegional }) => {
  return (
    <main className="flex-1 flex items-center justify-center p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
            Choose Your Analysis Mode
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Select how you'd like to analyze customer data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Search Customers Option */}
          <button
            onClick={onSelectSearch}
            className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-2 border-gray-300/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 transform hover:scale-[1.02] text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <SearchIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Customers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Look up individual customers by ID to analyze their churn risk and get detailed insights
              </p>
              <div className="pt-4">
                <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                  Get Started
                  <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>

          {/* Regional Insights Option */}
          <button
            onClick={onSelectRegional}
            className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-2 border-gray-300/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300 transform hover:scale-[1.02] text-left"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <svg className="h-12 w-12 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Regional Insights
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore geographic trends and analyze churn patterns across different regions
              </p>
              <div className="pt-4">
                <span className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
                  View Insights
                  <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
};
