

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';

type PropertyTab = 'Contact' | 'Company' | 'Deal';

const contactProperties = [
    { label: 'Lead Source', type: 'Dropdown' },
    { label: 'Last Contacted Date', type: 'Date' },
    { label: 'Lead Score', type: 'Number' },
];
const companyProperties = [
    { label: 'Annual Revenue', type: 'Currency' },
    { label: 'Number of Employees', type: 'Number' },
    { label: 'Industry', type: 'Dropdown' },
];
const dealProperties = [
    { label: 'Next Step', type: 'Text' },
    { label: 'Expected Close Date', type: 'Date' },
    { label: 'Priority', type: 'Dropdown' },
];


const PropertyItem: React.FC<{ label: string, type: string }> = ({ label, type }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg group">
        <div>
            <p className="font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-400">{type}</p>
        </div>
        <button className="font-medium text-cyber-cyan hover:underline text-sm opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
    </div>
);

const Properties: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PropertyTab>('Contact');

    const renderProperties = () => {
        switch (activeTab) {
            case 'Contact': return contactProperties.map(p => <PropertyItem key={p.label} {...p} />);
            case 'Company': return companyProperties.map(p => <PropertyItem key={p.label} {...p} />);
            case 'Deal': return dealProperties.map(p => <PropertyItem key={p.label} {...p} />);
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Manage Properties</h2>
            <p className="text-gray-400 -mt-4">Create custom properties to store data for your records.</p>
            
            <GlassCard className="p-6 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center border-b border-cyber-border mb-6">
                        {(['Contact', 'Company', 'Deal'] as PropertyTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-b-2 border-cyber-cyan text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {tab} Properties
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-cyber-cyan">{activeTab} Properties</h3>
                         <button className="flex items-center gap-2 px-3 py-1.5 bg-cyber-purple/80 text-white text-sm font-semibold rounded-md hover:bg-cyber-purple">
                            <PlusIcon className="w-4 h-4" /> Create Property
                        </button>
                    </div>

                    <div className="space-y-3">
                        {renderProperties()}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Properties;
