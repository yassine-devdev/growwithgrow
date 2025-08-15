
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon, NoteIcon, CallIcon, EmailIcon, MeetingIcon, PlusIcon } from './Icons';
import { Contact, Activity } from '../../../types';

interface ContactDetailModalProps {
    contact: Contact;
    allDeals: any[]; // A real app would have a proper Deal type
    onClose: () => void;
    onUpdateActivities: (contactId: number, activities: Activity[]) => void;
}

const ActivityIcon: React.FC<{type: Activity['type']}> = ({ type }) => {
    const iconMap = {
        Note: <NoteIcon className="w-5 h-5 text-yellow-300" />,
        Call: <CallIcon className="w-5 h-5 text-blue-300" />,
        Email: <EmailIcon className="w-5 h-5 text-green-300" />,
        Meeting: <MeetingIcon className="w-5 h-5 text-purple-300" />,
    };
    return iconMap[type];
};


const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, allDeals, onClose, onUpdateActivities }) => {
    const [activeTab, setActiveTab] = useState<'Activity' | 'Deals'>('Activity');
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (newNote.trim() === '') return;
        const note: Activity = {
            id: Date.now(),
            type: 'Note',
            content: newNote,
            date: new Date().toISOString().split('T')[0],
            user: 'Admin User' // Or logged in user
        };
        onUpdateActivities(contact.id, [note, ...contact.activities]);
        setNewNote('');
    };

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b border-cyber-border">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
                        <p className="text-cyber-cyan">{contact.email}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Details */}
                    <aside className="w-1/3 border-r border-cyber-border p-4 space-y-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-cyber-cyan">Contact Details</h3>
                        <div>
                            <p className="text-xs text-gray-400">Full Name</p>
                            <p className="text-white">{contact.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="text-white">{contact.email}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="text-white">{contact.phone || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400">Company</p>
                            <p className="text-white">{contact.company}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400">Owner</p>
                            <p className="text-white">{contact.owner}</p>
                        </div>
                    </aside>

                    {/* Right Panel: Tabs */}
                    <main className="w-2/3 flex flex-col">
                        <div className="flex-shrink-0 border-b border-cyber-border">
                            <button onClick={() => setActiveTab('Activity')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'Activity' ? 'text-white border-b-2 border-cyber-cyan' : 'text-gray-400'}`}>Activity</button>
                            <button onClick={() => setActiveTab('Deals')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'Deals' ? 'text-white border-b-2 border-cyber-cyan' : 'text-gray-400'}`}>Deals</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'Activity' && (
                                <div className="space-y-4">
                                     <div className="relative">
                                        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." rows={3} className="w-full bg-cyber-surface border border-cyber-border rounded-md p-2 text-white pr-10"></textarea>
                                        <button onClick={handleAddNote} className="absolute right-2 top-2 p-1 bg-cyber-purple rounded-md"><PlusIcon className="w-5 h-5"/></button>
                                    </div>
                                    {contact.activities.map(act => (
                                        <div key={act.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black/30 flex-shrink-0 flex items-center justify-center"><ActivityIcon type={act.type}/></div>
                                            <div>
                                                <p className="text-sm text-gray-400">{act.user} added a {act.type.toLowerCase()} &bull; {act.date}</p>
                                                <p className="text-white bg-cyber-surface p-2 rounded-md mt-1">{act.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'Deals' && (
                                <ul className="space-y-2">
                                   {contact.deals.length > 0 ? contact.deals.map(deal => (
                                       <li key={deal.id} className="p-3 bg-cyber-surface rounded-md">
                                            <p className="font-semibold text-white">{deal.name}</p>
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>${deal.value.toLocaleString()}</span>
                                                <span>{deal.stage}</span>
                                            </div>
                                       </li>
                                   )) : <p className="text-gray-500 text-center">No associated deals.</p>}
                                </ul>
                            )}
                        </div>
                    </main>
                </div>
            </GlassCard>
        </div>
    );
};

export default ContactDetailModal;
