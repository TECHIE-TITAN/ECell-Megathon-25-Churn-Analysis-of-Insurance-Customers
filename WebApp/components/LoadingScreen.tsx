import React from 'react';

const AnimatedLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 250 50" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    aria-label="Turing Finances Logo Loading"
  >
    <g>
      {/* Icon group */}
      <g transform="translate(0, 5)">
        {/* Static background icon */}
        <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 5 2 L 40 2 L 40 20 L 22.5 35 L 5 20 Z" />
          <path d="M 10 12 H 35" />
          <path d="M 19 10 A 3.5 3.5 0 0 1 26 10" />
          <path d="M 12.5 12 V 24" />
          <path d="M 17.5 12 V 24" />
          <path d="M 22.5 12 V 24" />
          <path d="M 27.5 12 V 24" />
          <path d="M 32.5 12 V 24" />
          <path d="M 20.5 25 L 22.5 29 L 24.5 25" />
        </g>
        
        {/* Animated line overlay */}
        <path 
          d="M 5 2 L 40 2 L 40 20 L 22.5 35 L 5 20 Z" 
          className="loading-line-animation text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
      
      {/* Text Group */}
      <g transform="translate(55, 8)" fill="currentColor" className="animate-pulse">
        <text 
          x="0" 
          y="10" 
          fontFamily="'Righteous', sans-serif" 
          fontSize="14" 
          letterSpacing="4"
          fontWeight="bold"
        >
          TURING FINANCES
        </text>
        
        <text 
          x="18" 
          y="28" 
          fontFamily="monospace, sans-serif" 
          fontSize="8" 
          letterSpacing="3"
        >
          WE KEEP YOU SAFE
        </text>
      </g>
    </g>
  </svg>
);


export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-slate-900">
      <div>
        <AnimatedLogo className="h-24 w-auto text-gray-600 dark:text-gray-300" />
      </div>
    </div>
  );
};
