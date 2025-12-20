import React from 'react';
import { LoaderIcon } from '../icons/LoaderIcon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, className, ...props }) => {
  const baseClasses = "flex justify-center items-center font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 disabled:cursor-not-allowed transition-colors active-press";
  const defaultClasses = "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-400/50 dark:disabled:bg-blue-500/50 text-white";
  
  return (
    <button
      {...props}
      className={`${baseClasses} ${className || defaultClasses}`}
    >
      {isLoading ? <LoaderIcon className="h-5 w-5 animate-spin" /> : children}
    </button>
  );
};