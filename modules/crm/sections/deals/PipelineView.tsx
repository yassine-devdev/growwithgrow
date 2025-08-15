

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import { Deal } from '../../../../types';
import AddDealModal from '../../components/AddDealModal';

const pipelineStages = ['Lead In', 'Contact Made', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const initialDeals: Deal[] = [
    { id: 1, name: 'CyberCorp Q4 Upgrade', contact: 'John Doe', company: 'CyberCorp', value: 250000, stage: 'Proposal Sent', closeDate: '2024-08-15' },
    { id: 2, name: 'OmniCorp Security Contract', contact: 'Jane Smith', company: 'OmniCorp', value: 75000, stage: 'Negotiation', closeDate: '2024-08-05' },
    { id: 3, name: 'Weyland-Yutani Expansion', contact: 'Deckard Cain', company: 'Weyland-Yutani', value: 500000, stage: 'Contact Made', closeDate: '2024-09-01' },
    { id: 4, name: 'Tyrell Corp Replicant License', contact: 'Rachael Tyrell', company: 'Tyrell Corp', value: 120000, stage: 'Won', closeDate: '2024-07-20' },
];

const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => (
    <GlassCard className="p-3 mb-3 cursor-grab active:cursor-grabbing bg-cyber-surface/60">
        <p className="font-bold text-white text-base">{deal.name}</p>
        <p className="text-sm text-gray-300">{deal.company}</p>
        <div className="flex justify-between items-center mt-2 text-xs">
            <span className="font-mono text-lg text-green-400">${deal.value.toLocaleString()}</span>
            <span className="text-gray-400">{deal.closeDate}</span>
        </div>
    </GlassCard>
);

const DealColumn: React.FC<{ title: string; deals: Deal[] }> = ({ title, deals }) => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const dealCount = deals.length;

    return (
        <div className="flex-shrink-0 w-72">
            <GlassCard className="p-4 h-full flex flex-col bg-cyber-surface/70">
                <div className="mb-4 border-b border-cyber-border/50 pb-2">
                    <h3 className="text-lg font-bold text-cyber-cyan">{title} ({dealCount})</h3>
                    <p className="text-sm font-mono text-gray-400">${totalValue.toLocaleString()}</p>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                </div>
            </GlassCard>
        </div>
    );
};

const PipelineView: React.FC = () => {
    const [deals, setDeals] = useState(initialDeals);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddDeal = (deal: Omit<Deal, 'id'>) => {
        const newDeal = { ...deal, id: Date.now() };
        setDeals(prev => [...prev, newDeal]);
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Deals Pipeline</h2>
                    <p className="text-gray-400">Track your deals through the sales process.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Deal
                </button>
            </div>

            <div className="flex-1 flex gap-2 overflow-x-auto pb-4">
                {pipelineStages.map(stage => (
                    <DealColumn
                        key={stage}
                        title={stage}
                        deals={deals.filter(d => d.stage === stage)}
                    />
                ))}
            </div>

            {isModalOpen && <AddDealModal onClose={() => setIsModalOpen(false)} onAddDeal={handleAddDeal} pipelineStages={pipelineStages} />}
        </div>
    );
};

export default PipelineView;
