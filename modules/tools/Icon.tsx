import React from 'react';

export const ToolsIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#171717"/>
        <path d="M10 18H14V14H10V18Z" fill="#a16207" />
        <path d="M9 14.5H15V12C15 11.4477 14.5523 11 14 11H10C9.44772 11 9 11.4477 9 12V14.5Z" fill="#a3a3a3" />
        <path d="M9 11V8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8V11H9Z" fill="#2563eb" />
    </svg>
);
