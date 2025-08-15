import React from 'react';

export const MarketIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#f3f4f6"/>
        <path d="M5 20V12H19V20" fill="#fef3c7"/>
        <rect x="5" y="19" width="14" height="2" fill="#fcd34d"/>
        <path d="M4 12L12 7L20 12H4Z" fill="#ef4444"/>
        <path d="M6 12L12 8L18 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <rect x="9" y="12" width="6" height="8" fill="#fde68a"/>
        <rect x="9.5" y="12.5" width="5" height="7" fill="#fcd34d" rx="1"/>
    </svg>
);
