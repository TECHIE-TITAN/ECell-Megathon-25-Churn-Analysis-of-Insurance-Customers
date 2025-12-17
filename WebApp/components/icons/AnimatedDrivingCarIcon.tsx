import React from 'react';
import { AnimatedIconProps } from '../../types';

export const AnimatedDrivingCarIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => {
    return (
        <div className={`animated-icon-container ${clicked ? 'clicked' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <g className="speed-lines">
                    <path d="M3 10h4M4 12h3M3 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <g className="car-drive-animation">
                    <path d="M21.36,9.52l-2.2-4.4A2.5,2.5,0,0,0,17,4H7a2.5,2.5,0,0,0-2.16,1.12l-2.2,4.4A2.5,2.5,0,0,0,4.5,13H5v3.5A1.5,1.5,0,0,0,6.5,18h2A1.5,1.5,0,0,0,10,16.5V13h4v3.5A1.5,1.5,0,0,0,15.5,18h2A1.5,1.5,0,0,0,19,16.5V13h.5a2.5,2.5,0,0,0,1.86-3.48ZM7.89,6h8.22l1.65,3.3H6.24ZM8.5,16a.5.5,0,1,1-.5-.5A.5.5,0,0,1,8.5,16Zm7,0a.5.5,0,1,1-.5-.5A.5.5,0,0,1,15.5,16Z"/>
                </g>
            </svg>
        </div>
    );
};