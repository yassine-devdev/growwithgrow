
import React, { useState, useMemo } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import { SearchIcon } from '../../../../components/icons/InterfaceIcons';
import AddDealModal from '../../components/AddDealModal';
import { Deal } from '../../../../types';

const pipelineStages = ['Lead In', 'Contact Made', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const initialDeals: Deal[] = [
    { id: 1, name: 'CyberCorp Q4 Upgrade', contact: 'John Doe', company: 'CyberCorp', value: 250000, stage: 'Proposal Sent', closeDate: '2024-08-15' },
    { id: 2, name: 'OmniCorp Security Contract', contact: 'Jane Smith', company: 'OmniCorp', value: 75000, stage: 'Negotiation', closeDate: '2024-08-05' },
    { id: 3, name: 'Weyland-Yutani Expansion', contact: 'Deckard Cain', company: 'Weyland-Yutani', value: 500000, stage: 'Contact Made', closeDate: '2024-09-01' },
    { id: 4, name: 'Tyrell Corp Replicant License', contact: 'Rachael Tyrell', company: 'Tyrell Corp', value: 120000, stage: 'Won', closeDate: '2024-07-20' },
    { id: 5, name: 'Bebop Freelance Bounty', contact: 'Spike Spiegel', company: 'Bebop Freelance', value: 50000, stage: 'Lost', closeDate: '2024-07-25' },
];

const stageClasses: { [key: string]: string } = {
    'Lead In': 'bg-gray-500/30 text-gray-300',
    'Contact Made': 'bg-blue-500/30 text-blue-300',
    'Proposal Sent': 'bg-yellow-500/30 text-yellow-300',
    'Negotiation': 'bg-orange-500/30 text-orange-300',
    'Won': 'bg-green-500/30 text-green-300',
    'Lost': 'bg-red-500/30 text-red-300',
};

const DealsListView: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => 
            deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.company.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [deals, searchQuery]);
    
    const handleAddDeal = (deal: Omit<Deal, 'id'>) => {
        const newDeal = { ...deal, id: Date.now() };
        setDeals(prev => [newDeal, ...prev]);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">All Deals</h2>
                    <p className="text-gray-400">Manage all deals in a list view.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Deal
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                 <div className="relative mb-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search deals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/30 border border-cyber-border rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-purple"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-left">
                        <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                            <tr>
                                {['Deal Name', 'Company', 'Value', 'Stage', 'Close Date', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {filteredDeals.map(deal => (
                                <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{deal.name}</td>
                                    <td className="p-3 text-gray-400">{deal.company}</td>
                                    <td className="p-3 text-green-400 font-mono">${deal.value.toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${stageClasses[deal.stage]}`}>{deal.stage}</span>
                                    </td>
                                    <td className="p-3 text-gray-400">{deal.closeDate}</td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            {isModalOpen && <AddDealModal onClose={() => setIsModalOpen(false)} onAddDeal={handleAddDeal} pipelineStages={pipelineStages} />}
        </div>
    );
};

export default DealsListView;
