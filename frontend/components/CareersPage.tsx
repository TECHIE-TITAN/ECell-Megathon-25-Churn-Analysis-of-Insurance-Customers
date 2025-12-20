import React from 'react';
import { Button } from './ui/Button';

interface CareersPageProps {
  onBack: () => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({ onBack }) => {
  return (
    <main className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 lg:p-12 border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
            Careers at Turing Finances
          </h1>
          <div className="mt-8 border-t border-gray-300/50 dark:border-gray-700/50 pt-8 space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              Join a team that's redefining the future of insurance. At Turing Finances, we are always looking for passionate, innovative, and driven individuals to help us on our mission. We foster a collaborative environment where your ideas can make a real impact.
            </p>
            <p className="leading-relaxed">
              We are currently hiring for roles in Data Science, Engineering, Product Management, and Customer Success. If you are excited by the prospect of solving complex problems and building next-generation financial products, we would love to hear from you.
            </p>
            <p className="leading-relaxed font-semibold text-gray-800 dark:text-gray-100">
              Please check our official careers portal for open listings. (This is a placeholder page).
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