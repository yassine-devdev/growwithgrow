

import React from 'react';
import AIChartCard from '../../../../components/AIChartCard';
import GlassCard from '../../../../components/GlassCard';

const LeadSources: React.FC = () => (
    <div className="h-full flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Lead Source Performance</h2>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
            <AIChartCard
                title="Leads by Source (Last 90 Days)"
                prompt="Create a bar chart comparing lead sources: Organic Search (120 leads), Paid Ads (85 leads), Referrals (60 leads), Social Media (45 leads), Cold Outreach (20 leads)."
            />
             <AIChartCard
                title="Conversion Rate by Source"
                prompt="Create a bar chart showing lead-to-deal conversion rate by source: Referrals (35%), Organic Search (25%), Paid Ads (18%), Social Media (12%), Cold Outreach (5%)."
            />
        </div>
    </div>
);

export default LeadSources;
