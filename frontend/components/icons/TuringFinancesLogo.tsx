import React from 'react';

export const TuringFinancesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 250 50" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    aria-label="Turing Finances Logo"
  >
    <g className="text-gray-800 dark:text-gray-200 transition-colors">
      {/* Icon group - Recreated from the reference image */}
      <g transform="translate(0, 5)" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Shield Outline */}
        <path d="M 5 2 L 40 2 L 40 20 L 22.5 35 L 5 20 Z" />
        {/* Horizontal Bar */}
        <path d="M 10 12 H 35" />
        {/* Top Arc */}
        <path d="M 19 10 A 3.5 3.5 0 0 1 26 10" />
        {/* Vertical Bars */}
        <path d="M 12.5 12 V 24" />
        <path d="M 17.5 12 V 24" />
        <path d="M 22.5 12 V 24" />
        <path d="M 27.5 12 V 24" />
        <path d="M 32.5 12 V 24" />
        {/* Inverted V */}
        <path d="M 20.5 25 L 22.5 29 L 24.5 25" />
      </g>
      
      {/* Text Group - Updated text and layout to match the image */}
      <g transform="translate(55, 8)" fill="currentColor">
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
