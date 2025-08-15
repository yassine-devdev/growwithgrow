

import React, { useState, useMemo } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import { SearchIcon } from '../../../../components/icons/InterfaceIcons';
import AddContactModal from '../../components/AddContactModal';
import { Contact, Deal, Activity } from '../../../../types';
import ContactDetailModal from '../../components/ContactDetailModal';

const initialContacts: Contact[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@cybercorp.com', company: 'CyberCorp', phone: '555-0101', leadStatus: 'Qualified', owner: 'Admin User', activities: [{id: 1, type: 'Note', content: 'Discussed Q4 budget.', date: '2024-07-22', user: 'Admin User'}], deals: [{ id: 1, name: 'CyberCorp Q4 Upgrade', contact: 'John Doe', company: 'CyberCorp', value: 250000, stage: 'Proposal Sent', closeDate: '2024-08-15' }] },
    { id: 2, name: 'Jane Smith', email: 'jane.s@omnicorp.com', company: 'OmniCorp', phone: '555-0102', leadStatus: 'Contacted', owner: 'Sarah Connor', activities: [], deals: [] },
    { id: 3, name: 'Deckard Cain', email: 'deckard@weyland.com', company: 'Weyland-Yutani', phone: '555-0103', leadStatus: 'New', owner: 'Kyle Reese', activities: [], deals: [] },
    { id: 4, name: 'Rachael Tyrell', email: 'rachael@tyrell.io', company: 'Tyrell Corp', phone: '555-0104', leadStatus: 'Qualified', owner: 'Admin User', activities: [], deals: [] },
    { id: 5, name: 'Spike Spiegel', email: 'spike@bebop.net', company: 'Bebop Freelance', phone: '555-0105', leadStatus: 'Lost', owner: 'Sarah Connor', activities: [], deals: [] },
];

const statusClasses = {
    New: 'bg-blue-500/30 text-blue-300',
    Contacted: 'bg-yellow-500/30 text-yellow-300',
    Qualified: 'bg-green-500/30 text-green-300',
    Lost: 'bg-red-500/30 text-red-300',
};

const AllContacts: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);
    
    const handleAddContact = (contact: Omit<Contact, 'id' | 'activities' | 'deals'>) => {
        const newContact = { ...contact, id: Date.now(), activities: [], deals: [] };
        setContacts(prev => [newContact, ...prev]);
    };

    const handleUpdateContactActivities = (contactId: number, newActivities: Activity[]) => {
        setContacts(prev => prev.map(c => c.id === contactId ? {...c, activities: newActivities} : c));
        if (selectedContact?.id === contactId) {
            setSelectedContact(prev => prev ? {...prev, activities: newActivities} : null);
        }
    };


    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">All Contacts</h2>
                    <p className="text-gray-400">Manage your contacts and leads.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Contact
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                 <div className="relative mb-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search contacts..."
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
                                {['Name', 'Email', 'Company', 'Phone', 'Lead Status', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{contact.name}</td>
                                    <td className="p-3 text-gray-400">{contact.email}</td>
                                    <td className="p-3 text-gray-400">{contact.company}</td>
                                    <td className="p-3 text-gray-400 font-mono">{contact.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[contact.leadStatus]}`}>{contact.leadStatus}</span>
                                    </td>
                                    <td className="p-3 text-right"><button onClick={() => setSelectedContact(contact)} className="font-medium text-cyber-cyan hover:underline">Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            {isAddModalOpen && <AddContactModal onClose={() => setIsAddModalOpen(false)} onAddContact={handleAddContact} />}
            {selectedContact && <ContactDetailModal contact={selectedContact} allDeals={[]} onClose={() => setSelectedContact(null)} onUpdateActivities={handleUpdateContactActivities} />}
        </div>
    );
};

export default AllContacts;
