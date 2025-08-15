
import React, { useMemo } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';
import { Company, Contact } from '../../../types';

interface CompanyDetailModalProps {
    company: Company;
    allContacts: Contact[];
    onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, allContacts, onClose }) => {
    
    const associatedContacts = useMemo(() => {
        return allContacts.filter(c => c.company === company.name);
    }, [company, allContacts]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b border-cyber-border">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{company.name}</h2>
                        <p className="text-cyber-cyan">{company.industry}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-cyber-cyan mb-2">Company Info</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Owner</p>
                                <p className="text-white">{company.owner}</p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-white">{company.city}, {company.country}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-cyber-cyan mb-2">Associated Contacts ({associatedContacts.length})</h3>
                        <ul className="space-y-2">
                           {associatedContacts.length > 0 ? associatedContacts.map(contact => (
                               <li key={contact.id} className="p-2 bg-cyber-surface rounded-md flex justify-between items-center">
                                   <div>
                                       <p className="font-semibold text-white">{contact.name}</p>
                                       <p className="text-xs text-gray-400">{contact.email}</p>
                                   </div>
                                    <button className="text-xs font-medium text-cyber-cyan hover:underline">View</button>
                               </li>
                           )) : <p className="text-gray-500 text-center text-sm">No contacts associated with this company.</p>}
                        </ul>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default CompanyDetailModal;
