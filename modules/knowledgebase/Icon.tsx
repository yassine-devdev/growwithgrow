import React from 'react';

export const KnowledgeIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#fcd34d"/>
        <rect x="5" y="4" width="14" height="16" rx="2" fill="white"/>
        <path d="M8 8H16" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 11H16" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 14H12" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
