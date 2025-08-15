

import React from 'react';
import AIChartCard from '../../../../components/AIChartCard';
import GlassCard from '../../../../components/GlassCard';

const ActivityReports: React.FC = () => (
    <div className="h-full flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Activity Reports</h2>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
            <AIChartCard
                title="Activity Breakdown (Last 30 Days)"
                prompt="Create a pie chart for sales activities: Emails Sent (150), Calls Made (95), Meetings Booked (45), Demos Given (25)."
            />
            <AIChartCard
                title="Activities Over Time (Last Week)"
                prompt="Create a line chart showing total daily activities for the last 7 days: Day 1 (45), Day 2 (52), Day 3 (48), Day 4 (61), Day 5 (55), Day 6 (30), Day 7 (25)."
            />
        </div>
    </div>
);

export default ActivityReports;
