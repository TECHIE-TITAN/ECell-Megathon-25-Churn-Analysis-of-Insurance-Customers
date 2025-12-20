import React from 'react';
import { AnimatedIconProps } from '../../types';

export const AnimatedTaxBillIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => {
    return (
        <div className={`animated-icon-container ${clicked ? 'clicked' : ''}`}>
            <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V3.75a.75.75 0 000-1.5H4.5zM6 4.5v.75A.75.75 0 015.25 6h-.75a.75.75 0 01-.75-.75V4.5H6zm12 0v.75a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V4.5h-2.25zM6 18V9h12v9H6z" clipRule="evenodd" />
                <path d="M8.25 10.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" />
                <g className="tax-stamp" fill="rgba(239, 68, 68, 0.8)">
                    <text x="12" y="14" fontSize="5" textAnchor="middle" fontWeight="bold" transform="rotate(-15 12 12)">PAID</text>
                </g>
            </svg>
        </div>
    );
};