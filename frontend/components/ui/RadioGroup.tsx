import React from 'react';

interface RadioGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { label: string, value: string | boolean }[];
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, value, onChange, options, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-center space-x-4">
        {options.map(option => (
          <label key={String(option.value)} className={`flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name={label}
              value={String(option.value)}
              checked={value === String(option.value)}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500 focus:ring-blue-500 dark:focus:ring-blue-600 ring-offset-gray-100 dark:ring-offset-slate-900 focus:ring-2 disabled:cursor-not-allowed"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};