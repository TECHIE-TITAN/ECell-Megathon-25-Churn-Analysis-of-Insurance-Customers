import React from 'react';
import { AnimatedIconProps } from '../../types';

// FIX: Update component to conform to AnimatedIconProps for type consistency across all sector icons.
export const AnimatedHomeIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => (
    <div className="home-icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 3v1.5M12 3l-8.25 8.25M21 12l-8.25 8.25" />
            <path stroke="none" className="home-window" d="M10.5 10.5h3v3h-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955a.75.75 0 01-.53 1.28H19.5v7.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 20.25v-7.5H3.78a.75.75 0 01-.53-1.28z" />
        </svg>
    </div>
);