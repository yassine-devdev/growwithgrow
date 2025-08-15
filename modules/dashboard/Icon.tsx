import React from 'react';

export const DashboardIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="dashboard-grad-new" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#dashboard-grad-new)"/>
        <rect x="5" y="5" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
        <rect x="13" y="5" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
        <rect x="5" y="13" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
        <rect x="13" y="13" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
    </svg>
);
