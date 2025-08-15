import React from 'react';

export const ConciergeIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="concierge-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#171717" />
            </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#concierge-grad)"/>
        <path d="M12 2L14.4722 8.78885H21.5595L15.5436 13.2111L18.0159 20L12 15.5777L5.98413 20L8.45635 13.2111L2.44048 8.78885H9.52778L12 2Z" fill="#facc15"/>
    </svg>
);
