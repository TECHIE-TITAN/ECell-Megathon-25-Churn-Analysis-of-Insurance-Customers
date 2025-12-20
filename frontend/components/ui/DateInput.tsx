import React from 'react';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const DateInput: React.FC<DateInputProps> = ({ label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="date"
        {...props}
        className="w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
      />
    </div>
  );
};