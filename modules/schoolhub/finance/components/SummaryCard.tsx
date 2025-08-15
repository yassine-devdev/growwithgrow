
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const SummaryCard: React.FC = () => (
    <GlassCard className="p-4">
        <h3 className="text-lg font-bold mb-4 text-white">Financial Summary</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Revenue (YTD)</span>
                <span className="font-bold text-green-400 text-lg">$1,250,430</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Expenses (YTD)</span>
                <span className="font-bold text-red-400 text-lg">$875,120</span>
            </div>
             <div className="flex justify-between items-center pt-2 border-t mt-2 border-cyber-border">
                <span className="text-white font-bold">Net Profit</span>
                <span className="font-bold text-white text-xl">$375,310</span>
            </div>
        </div>
    </GlassCard>
);

export default SummaryCard;
