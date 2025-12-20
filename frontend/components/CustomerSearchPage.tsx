import React, { useState } from 'react';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { SearchIcon } from './icons/SearchIcon';
import { LoaderIcon } from './icons/LoaderIcon';

interface CustomerSearchPageProps {
  onSearch: (customerId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const CustomerSearchPage: React.FC<CustomerSearchPageProps> = ({ onSearch, isLoading, error }) => {
  const [customerId, setCustomerId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId.trim()) {
      onSearch(customerId.trim());
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 lg:p-8">
      <div className="max-w-xl w-full mx-auto text-center">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-300/50 dark:border-gray-700/50 rounded-xl p-8 sm:p-12 shadow-2xl">
          <SearchIcon className="mx-auto h-16 w-16 text-blue-500 dark:text-blue-400" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-4xl font-display">
            Customer Database Search
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Enter a customer's Individual ID to retrieve their profile and churn risk analysis.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-start gap-4">
            <TextInput
              label="Customer ID"
              id="customer-id"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g., 221301158547.0"
              className="w-full"
              aria-label="Customer ID Input"
            />
            <Button type="submit" isLoading={isLoading} disabled={isLoading || !customerId.trim()} className="w-full sm:w-auto">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          {error && <p className="mt-4 text-red-500 dark:text-red-400 text-sm">{error}</p>}
           <div className="mt-6 text-left text-xs text-gray-500 dark:text-gray-500 bg-gray-200/50 dark:bg-gray-900/50 p-3 rounded-lg">
              <p className="mb-2">For demonstration, try these customer IDs:</p>
              <div className="space-y-1">
                <p><code className="font-mono bg-white/50 dark:bg-black/50 px-2 py-1 rounded">221301158547.0</code></p>
                <p><code className="font-mono bg-white/50 dark:bg-black/50 px-2 py-1 rounded">221300574354.0</code></p>
                <p><code className="font-mono bg-white/50 dark:bg-black/50 px-2 py-1 rounded">221300650463.0</code></p>
                <p><code className="font-mono bg-white/50 dark:bg-black/50 px-2 py-1 rounded">221302501419.0</code></p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
};