

import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const billingHistory = [
    { id: 'INV-001', date: '2024-07-01', amount: 2500, status: 'Paid' },
    { id: 'INV-002', date: '2024-06-01', amount: 2500, status: 'Paid' },
    { id: 'INV-003', date: '2024-05-01', amount: 2500, status: 'Paid' },
];

const PlanCard: React.FC<{ name: string, price: string, features: string[], current?: boolean }> = ({ name, price, features, current = false }) => (
    <GlassCard className={`p-6 flex flex-col text-center border-2 ${current ? 'border-cyber-purple' : 'border-cyber-border'}`}>
        <h3 className={`font-bold text-xl ${current ? 'text-cyber-purple' : 'text-white'}`}>{name}</h3>
        <p className="text-4xl font-bold my-4 text-white">{price}<span className="text-base font-normal text-gray-400">/mo</span></p>
        <ul className="space-y-2 text-gray-400 text-sm">
            {features.map(f => <li key={f}>{f}</li>)}
        </ul>
        <button className={`mt-6 w-full py-2 rounded-lg font-semibold ${current ? 'bg-cyber-purple text-white' : 'bg-cyber-surface text-cyber-cyan hover:bg-cyber-cyan hover:text-black transition-colors'}`}>
            {current ? 'Current Plan' : 'Upgrade'}
        </button>
    </GlassCard>
);

const Billing: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Billing & Subscriptions</h2>
            <p className="text-gray-400 -mt-4">Manage plans and view billing history for North Star Academy.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <PlanCard name="Basic" price="$500" features={['Up to 500 Students', 'Core CRM Features', 'Basic Analytics']} />
                <PlanCard name="Pro" price="$1500" features={['Up to 2000 Students', 'All Basic Features', 'Advanced Analytics', 'API Access']} />
                <PlanCard name="Enterprise" price="$2500" features={['Unlimited Students', 'All Pro Features', 'Dedicated Support', 'Custom Integrations']} current={true} />
            </div>

            <GlassCard className="p-6 flex-1 flex flex-col overflow-hidden">
                <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Billing History</h3>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                            <tr>
                                {['Invoice ID', 'Date', 'Amount', 'Status', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {billingHistory.map(item => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3 font-mono text-white">{item.id}</td>
                                    <td className="p-3 text-gray-400">{item.date}</td>
                                    <td className="p-3 text-white">${item.amount.toFixed(2)}</td>
                                    <td className="p-3 text-green-400">{item.status}</td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Download</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default Billing;
