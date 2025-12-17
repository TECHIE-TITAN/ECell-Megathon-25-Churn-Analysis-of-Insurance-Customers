import React from 'react';
import { AnimatedIconProps } from '../../types';

export const AnimatedHeartIcon: React.FC<AnimatedIconProps> = ({ clicked, ...props }) => {
    return (
        <div className={`like-button-wrap ${clicked ? 'liked' : ''}`}>
            <svg id="likeButton" width="98" height="98" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 680" xmlSpace="preserve" {...props}>
                <g id="heart">
                    <path d="m493.9 212.7c-35.7-35.7-93.5-35.7-129.1 0-12.4 12.3-20.4 27.4-24.2 43.2-3.8-15.8-11.8-30.8-24.2-43.2-35.7-35.7-93.5-35.7-129.1 0-35.7 35.7-35.7 93.5 0 129.1l153.3 153.4 153.4-153.4c35.6-35.6 35.6-93.4-.1-129.1z" />
                </g>
                <g id="circle">
                    <circle className="st0" cx="340" cy="340" r="220" />
                </g>
                <g id="particle">
                    <path d="m159.4 190.6-47.1-51.4 26.1-15.1z" />
                    <path d="m135.9 217.5-66.5-20.9 15.1-26.2z" />
                    <path d="m521.7 190.2 47.1-51.4-26.1-15.1z" />
                    <path d="m545.2 217.2 66.5-21-15-26.1z" />
                    <path d="m521.7 490.5 47.1 51.5-26.1 15z" />
                    <path d="m545.2 463.6 66.5 20.9-15 26.2z" />
                    <path d="m159.4 490.9-47.1 51.4 26.1 15.1z" />
                    <path d="m135.9 463.9-66.5 21 15.1 26.1z" />
                </g>
            </svg>
        </div>
    );
};