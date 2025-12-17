import React from 'react';
import { Button } from './ui/Button';

interface BusinessesPageProps {
  onBack: () => void;
}

export const BusinessesPage: React.FC<BusinessesPageProps> = ({ onBack }) => {
  return (
    <main className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 lg:p-12 border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
            Solutions for Businesses
          </h1>
          <div className="mt-8 border-t border-gray-300/50 dark:border-gray-700/50 pt-8 space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              Turing Finances provides a comprehensive suite of insurance solutions designed for the modern enterprise. Our B2B platform offers powerful tools for risk management, employee benefits, and commercial liability, all powered by our industry-leading predictive analytics.
            </p>
            <p className="leading-relaxed">
              Whether you are a small startup or a large corporation, our scalable solutions can help you protect your assets, ensure compliance, and create a safer environment for your employees. Partner with us to integrate intelligent insurance into your business strategy.
            </p>
             <p className="leading-relaxed font-semibold text-gray-800 dark:text-gray-100">
              Contact our sales team to learn more about our commercial offerings. (This is a placeholder page).
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
            <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
                &larr; Back to Home
            </Button>
        </div>
      </div>
    </main>
  );
};