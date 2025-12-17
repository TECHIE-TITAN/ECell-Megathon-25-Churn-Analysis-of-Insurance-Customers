import React from 'react';
import { AnimatedIconProps } from '../../types';

export const AnimatedBackpackIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => {
    return (
        <div className={`animated-icon-container ${clicked ? 'clicked' : ''}`}>
            <div className="backpack-wiggle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M19.5,9.5c0,2-3,2.5-3.5,2.5s-1.5-0.5-2.5-0.5s-2,0.5-2.5,0.5S7.5,11.5,7.5,9.5 C7.5,7.5,9,6,12,6S19.5,7.5,19.5,9.5z"/>
                    <path d="M18,7.3c0-2-1.3-4.8-2.5-5.8c-0.8-0.6-2.3-1.5-3.5-1.5s-2.7,0.9-3.5,1.5C7.3,2.5,6,5.3,6,7.3 c0,0-2.3,0.2-2.8,0.7C2.8,8.4,2.2,9.2,2.2,10c0,0,0.2,5.2,0.5,7c0.3,2,1.3,4.5,3.8,4.5h11c2.5,0,3.5-2.5,3.8-4.5 c0.3-1.8,0.5-7,0.5-7c0-0.8-0.5-1.6-1-2C20.3,7.5,18,7.3,18,7.3z M12,7.5c-2,0-3.5,1.1-3.5,2s2.5,2,2.5,2s1.5-0.5,2.5-0.5 s2,0.5,2.5,0.5s2.5,0,2.5-2S14,7.5,12,7.5z M16.5,18.5h-9c-1,0-1.5-1.5-1.8-2.5l-0.3-2h13l-0.3,2 C18,17,17.5,18.5,16.5,18.5z"/>
                </svg>
            </div>
        </div>
    );
};