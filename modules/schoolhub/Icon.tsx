import React from 'react';

export const SchoolIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#E5E7EB"/>
        <rect x="3" y="6" width="18" height="15" rx="2" fill="white"/>
        <path d="M3 10C3 7.79086 4.79086 6 7 6H17C19.2091 6 21 7.79086 21 10V6H3V10Z" fill="#60A5FA"/>
        <circle cx="8" cy="6" r="1.5" fill="#D1D5DB"/>
        <circle cx="16" cy="6" r="1.5" fill="#D1D5DB"/>
        <rect x="6" y="10" width="3" height="2" rx="1" fill="#D1D5DB"/>
        <rect x="10.5" y="10" width="3" height="2" rx="1" fill="#D1D5DB"/>
        <rect x="15" y="10" width="3" height="2" rx="1" fill="#D1D5DB"/>
        <rect x="6" y="14" width="3" height="2" rx="1" fill="#D1D5DB"/>
        <rect x="10.5" y="14" width="3" height="2" rx="1" fill="#D1D5DB"/>
    </svg>
);
