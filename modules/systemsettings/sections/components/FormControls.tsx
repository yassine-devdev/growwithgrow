
import React from 'react';

export const ToggleSwitch: React.FC<{ label: string, enabled: boolean, description: string }> = ({ label, enabled, description }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <span className="text-white font-medium">{label}</span>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors ${enabled ? 'bg-cyber-cyan' : 'bg-gray-600'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);
