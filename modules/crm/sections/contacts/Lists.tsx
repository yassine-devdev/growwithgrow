

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';

interface ContactList {
    id: number;
    name: string;
    contactCount: number;
}

const initialLists: ContactList[] = [
    { id: 1, name: 'Newsletter Subscribers', contactCount: 1250 },
    { id: 2, name: 'High-Value Leads', contactCount: 88 },
    { id: 3, name: 'Q3 Conference Attendees', contactCount: 215 },
];

const Lists: React.FC = () => {
    const [lists, setLists] = useState<ContactList[]>(initialLists);
    
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Contact Lists</h2>
            <p className="text-gray-400 -mt-4">Segment your contacts into targeted lists.</p>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto pr-2">
                {lists.map(list => (
                    <GlassCard key={list.id} className="p-6 flex flex-col items-center justify-center text-center transition-all hover:border-cyber-cyan/50">
                        <p className="text-xl font-bold text-white">{list.name}</p>
                        <p className="text-4xl font-mono font-bold text-cyber-cyan my-4">{list.contactCount}</p>
                        <button className="text-sm font-semibold text-cyber-cyan hover:underline">View Contacts</button>
                    </GlassCard>
                ))}
                 <GlassCard className="p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-cyber-border hover:border-cyber-cyan cursor-pointer transition-colors">
                     <PlusIcon className="w-12 h-12 text-gray-500" />
                     <p className="mt-2 font-bold text-gray-400">Create New List</p>
                 </GlassCard>
            </div>
        </div>
    );
};

export default Lists;
