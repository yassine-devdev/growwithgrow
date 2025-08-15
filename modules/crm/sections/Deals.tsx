

import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CRMDealsSection } from '../types';
import DealsL3Sidebar from '../components/DealsL3Sidebar';
import PipelineView from './deals/PipelineView';
import DealsListView from './deals/DealsListView';
import Forecasting from './deals/Forecasting';

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const Deals: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<CRMDealsSection>('Pipeline View');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Pipeline View':
                return <PipelineView />;
            case 'List View':
                return <DealsListView />;
            case 'Forecasting':
                return <Forecasting />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    };


    return (
        <div className="flex h-full">
            <DealsL3Sidebar activeSection={activeL3Section} setActiveSection={setActiveL3Section} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3">
                {renderContent()}
            </main>
        </div>
    );
};

export default Deals;
