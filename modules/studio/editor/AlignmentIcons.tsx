
import React from 'react';

// Horizontal Alignment
export const AlignLeftIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" y1="10" x2="11" y2="10"></line>
        <line x1="21" y1="6" x2="7" y2="6"></line>
        <line x1="21" y1="14" x2="11" y2="14"></line>
        <line x1="21" y1="18" x2="7" y2="18"></line>
        <line x1="3" y1="3" x2="3" y2="21"></line>
    </svg>
);
export const AlignHCenterIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="10" x2="6" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="18" y1="14" x2="6" y2="14"></line>
        <line x1="21" y1="18" x2="3" y2="18"></line>
        <line x1="12" y1="3" x2="12" y2="21"></line>
    </svg>
);
export const AlignRightIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="13" y1="10" x2="3" y2="10"></line>
        <line x1="17" y1="6" x2="3" y2="6"></line>
        <line x1="13" y1="14" x2="3" y2="14"></line>
        <line x1="17" y1="18" x2="3" y2="18"></line>
        <line x1="21" y1="3" x2="21" y2="21"></line>
    </svg>
);

// Vertical Alignment
export const AlignTopIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="21" x2="10" y2="11"></line>
        <line x1="6" y1="21" x2="6" y2="7"></line>
        <line x1="14" y1="21" x2="14" y2="11"></line>
        <line x1="18" y1="21" x2="18" y2="7"></line>
        <line x1="3" y1="3" x2="21" y2="3"></line>
    </svg>
);
export const AlignVCenterIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="18" x2="10" y2="6"></line>
        <line x1="6" y1="21" x2="6" y2="3"></line>
        <line x1="14" y1="18" x2="14" y2="6"></line>
        <line x1="18" y1="21" x2="18" y2="3"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
    </svg>
);
export const AlignBottomIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="3" x2="10" y2="13"></line>
        <line x1="6" y1="3" x2="6" y2="17"></line>
        <line x1="14" y1="3" x2="14" y2="13"></line>
        <line x1="18" y1="3" x2="18" y2="17"></line>
        <line x1="3" y1="21" x2="21" y2="21"></line>
    </svg>
);
