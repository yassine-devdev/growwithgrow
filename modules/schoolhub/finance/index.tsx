
import React, { useState } from 'react';
import FinanceL2Sidebar from './components/FinanceL2Sidebar';
import RevenueCard from './components/RevenueCard';
import ExpenseBreakdownCard from './components/ExpenseBreakdownCard';
import TransactionListCard from './components/TransactionListCard';
import SummaryCard from './components/SummaryCard';


const FinanceView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('revenue-analytics');

    const navItems = [
        { id: 'revenue-analytics', label: 'Revenue Analytics' },
        { id: 'expense-management', label: 'Expense Management' },
        { id: 'cost-efficiency-ai', label: 'Cost Efficiency AI' },
        { id: 'program-roi', label: 'Program & Grant ROI' },
        { id: 'financial-forecasting', label: 'Financial Forecasting' },
        { id: 'audit-compliance', label: 'Audit Compliance' },
        { id: 'financial-aid', label: 'Financial Aid Management' },
        { id: 'grant-assistant', label: 'Grant Writing Assistant' },
        { id: 'fundraising', label: 'Fundraising & Donor Mgt.' },
        { id: 'investment-tracking', label: 'Investment Tracking' },
        { id: 'impact-analysis', label: 'Financial Impact Analysis' }
    ];

    const renderContent = () => {
        return (
            <div className="h-full flex flex-col gap-6">
                 <h1 className="text-2xl font-bold text-white mb-0">{navItems.find(item => item.id === activeL2Item)?.label || 'Finance Dashboard'}</h1>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <RevenueCard />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                            <SummaryCard />
                            <ExpenseBreakdownCard />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <TransactionListCard />
                    </div>
                 </div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            <FinanceL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                 {renderContent()}
            </main>
        </div>
    );
};

export default FinanceView;
