
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const transactions = [
    { id: 'T001', description: 'Tuition Fee - J. Doe', amount: 5500.00, status: 'Completed', date: '2024-07-20' },
    { id: 'T002', description: 'Vendor Payment - Supplies Co.', amount: -450.50, status: 'Completed', date: '2024-07-19' },
    { id: 'T003', description: 'Donation - A. Smith', amount: 1000.00, status: 'Completed', date: '2024-07-18' },
    { id: 'T004', description: 'Salary - Dr. A. Lovelace', amount: -6200.00, status: 'Pending', date: '2024-07-22' },
    { id: 'T005', description: 'Cafeteria Sales', amount: 1250.75, status: 'Completed', date: '2024-07-21' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const color = {
        Completed: 'bg-green-500/30 text-green-300',
        Pending: 'bg-yellow-500/30 text-yellow-300',
    }[status] || 'bg-gray-500/30 text-gray-400';
    return <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${color}`}>{status}</span>;
}

const TransactionListCard: React.FC = () => {
    return (
        <GlassCard className="h-full flex flex-col p-4">
            <h3 className="text-lg font-bold mb-4 text-white">Recent Transactions</h3>
            <div className="flex-1 overflow-y-auto -mx-4">
                <ul className="divide-y divide-cyber-border/50">
                    {transactions.map(t => (
                        <li key={t.id} className="p-4 hover:bg-white/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white truncate">{t.description}</p>
                                    <p className="text-xs text-gray-400">{t.id} &bull; {t.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                                    </p>
                                    <StatusBadge status={t.status} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </GlassCard>
    );
};

export default TransactionListCard;
