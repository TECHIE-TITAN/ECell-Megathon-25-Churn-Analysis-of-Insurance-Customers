import React from 'react';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly { value: string, label: string }[];
  disabled?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};