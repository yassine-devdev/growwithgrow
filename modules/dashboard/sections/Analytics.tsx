
import React from 'react';
import AIChartCard from '../../../components/AIChartCard';

const Analytics: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
            <AIChartCard 
                title="User Engagement by Module"
                prompt="Create a bar chart showing user engagement time per module: Dashboard 250 hours, AI Tools 450 hours, School Hub 380 hours, Comms 320 hours, Knowledge Base 180 hours."
                className="flex-grow"
            />
            <AIChartCard 
                title="AI Query Success Rate"
                prompt="Create a line chart showing AI query success rate over the last week: Monday 98%, Tuesday 97%, Wednesday 99%, Thursday 96%, Friday 98%, Saturday 99%, Sunday 99.5%."
                className="flex-grow"
            />
        </div>
    );
};

export default Analytics;
