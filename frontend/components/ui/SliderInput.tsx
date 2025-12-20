import React from 'react';

interface SliderInputProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: string;
  format?: (value: number) => string;
  disabled?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({ label, min, max, step, value, onChange, unit, format, disabled=false }) => {
  const displayValue = format ? format(value) : value;

  return (
    <div className="space-y-2">
      <label className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>{label}</span>
        <span className={`font-bold px-2 py-1 rounded ${disabled ? 'text-gray-500 bg-gray-200 dark:bg-gray-700/50' : 'text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/20'}`}>
          {unit === '$' && unit}{displayValue}{unit !== '$' && ` ${unit}`}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 disabled:accent-gray-400 dark:disabled:accent-gray-500 disabled:cursor-not-allowed"
      />
    </div>
  );
};
