import React from 'react';

export const CommsIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#818cf8"/>
        <path d="M4 8H20L12 14L4 8Z" fill="#fef08a"/>
        <path d="M4 17V8L12 14L20 8V17H4Z" fill="#facc15"/>
        <circle cx="18" cy="7" r="4" fill="#ef4444" stroke="white" strokeWidth="1.5"/>
    </svg>
);
