
import React from 'react';
import AIChartCard from '../../../../components/AIChartCard';
import GlassCard from '../../../../components/GlassCard';

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <GlassCard className="p-4 transition-all hover:border-cyber-cyan/50 text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </GlassCard>
);

const Forecasting: React.FC = () => (
    <div className="h-full flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white">Sales Forecasting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KpiCard title="Projected Revenue (Q3)" value="$425k" />
            <KpiCard title="Pipeline Coverage" value="3.2x" />
            <KpiCard title="Quota Attainment" value="85%" />
        </div>
        <div className="flex-1 min-h-0">
             <AIChartCard
                title="Revenue Forecast (Next 4 Quarters)"
                prompt="Create a line chart for quarterly revenue forecast. Q3 (current): $380k actual. Projections: Q4: $450k, Q1 '25: $480k, Q2 '25: $520k."
                className="h-full"
            />
        </div>
    </div>
);

export default Forecasting;
