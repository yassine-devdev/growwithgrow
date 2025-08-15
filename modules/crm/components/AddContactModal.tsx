
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';

interface AddContactModalProps {
    onClose: () => void;
    onAddContact: (contact: { name: string; email: string; company: string; phone: string; leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Lost' }) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAddContact }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [leadStatus, setLeadStatus] = useState<'New' | 'Contacted' | 'Qualified' | 'Lost'>('New');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            onAddContact({ name, email, company, phone, leadStatus });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => onClose()}>
            <GlassCard className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">Add New Contact</h2>
                    <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                            <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="leadStatus" className="block text-sm font-medium text-gray-300 mb-1">Lead Status</label>
                        <select id="leadStatus" value={leadStatus} onChange={e => setLeadStatus(e.target.value as any)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple">
                            <option>New</option>
                            <option>Contacted</option>
                            <option>Qualified</option>
                            <option>Lost</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => onClose()} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyber-purple text-white font-bold hover:shadow-glow-purple transition-shadow">Add Contact</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddContactModal;
