import React from 'react';
import { AnimatedIconProps } from '../../types';

export const AnimatedCreditCardIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => {
    return (
        <div className={`animated-icon-container ${clicked ? 'clicked' : ''}`} style={{ perspective: '1000px' }}>
            <div className="card-flip">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15z" />
                    <path fill="#fff" opacity="0.5" d="M5 8h14v2H5z" />
                    <path fill="#fff" opacity="0.7" d="M7 14h4v2H7z" />
                </svg>
            </div>
        </div>
    );
};