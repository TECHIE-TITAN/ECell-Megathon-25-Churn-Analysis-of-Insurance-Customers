import React from 'react';
import { SectorData } from '../types';
import { Button } from './ui/Button';

interface SectorPageProps {
  sector: SectorData;
  onBack: () => void;
}

export const SectorPage: React.FC<SectorPageProps> = ({ sector, onBack }) => {
  return (
    <main className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 lg:p-12 border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8">
            <div className="flex-shrink-0 bg-blue-500/10 dark:bg-blue-400/10 p-5 rounded-full">
              {/* FIX: The icon component requires a 'clicked' prop which was missing. Setting it to true. */}
              <sector.icon className="h-20 w-20 text-blue-500 dark:text-blue-400" clicked={true} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
                {sector.title}
              </h1>
              <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                {sector.pageContent.heading}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-300/50 dark:border-gray-700/50 pt-8 space-y-4 text-gray-700 dark:text-gray-300">
            {sector.pageContent.paragraphs.map((p, index) => (
              <p key={index} className="leading-relaxed">
                {p}
              </p>
            ))}
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