
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';
import { Deal } from '../../../types';

interface AddDealModalProps {
    onClose: () => void;
    onAddDeal: (deal: Omit<Deal, 'id'>) => void;
    pipelineStages: string[];
}

const AddDealModal: React.FC<AddDealModalProps> = ({ onClose, onAddDeal, pipelineStages }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [contact, setContact] = useState('');
    const [value, setValue] = useState(0);
    const [stage, setStage] = useState(pipelineStages[0] || '');
    const [closeDate, setCloseDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && value > 0) {
            onAddDeal({ name, company, contact, value, stage, closeDate });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <GlassCard className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">Add New Deal</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Deal Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                            <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
                            <input type="text" id="contact" value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">Value ($)</label>
                            <input type="number" id="value" value={value} onChange={e => setValue(Number(e.target.value))} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="stage" className="block text-sm font-medium text-gray-300 mb-1">Stage</label>
                            <select id="stage" value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple">
                                {pipelineStages.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="closeDate" className="block text-sm font-medium text-gray-300 mb-1">Expected Close Date</label>
                        <input type="date" id="closeDate" value={closeDate} onChange={e => setCloseDate(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyber-purple text-white font-bold hover:shadow-glow-purple transition-shadow">Add Deal</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddDealModal;
