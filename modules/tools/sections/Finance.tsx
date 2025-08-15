import React, { useState } from 'react';
import ToolsL3Sidebar from '../components/ToolsL3Sidebar';
import { ToolsFinanceSection } from '../types';
import GlassCard from '../../../components/GlassCard';
import Placeholder from '../../../components/Placeholder';


const Finance: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ToolsFinanceSection>('Expense Tracker');

    const renderContent = () => {
        return <Placeholder sectionName={activeL3Section} />;
    };

    return (
        <div className="flex h-full">
            <ToolsL3Sidebar 
                activeL2Section="Finance" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};
export default Finance;
