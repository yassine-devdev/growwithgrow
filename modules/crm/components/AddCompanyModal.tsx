
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';
import { Company } from '../../../types';

interface AddCompanyModalProps {
    onClose: () => void;
    onAddCompany: (company: Omit<Company, 'id'>) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ onClose, onAddCompany }) => {
    const [name, setName] = useState('');
    const [owner, setOwner] = useState('');
    const [industry, setIndustry] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onAddCompany({ name, owner, industry, city, country });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <GlassCard className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">Add New Company</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="owner" className="block text-sm font-medium text-gray-300 mb-1">Company Owner</label>
                            <input type="text" id="owner" value={owner} onChange={e => setOwner(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">City</label>
                            <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                            <input type="text" id="country" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
                        <input type="text" id="industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyber-purple text-white font-bold hover:shadow-glow-purple transition-shadow">Add Company</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddCompanyModal;
