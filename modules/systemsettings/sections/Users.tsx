
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import SystemSettingsL3Sidebar from '../components/SystemSettingsL3Sidebar';
import { SystemSettingsUsersSection } from '../types';
import Placeholder from '../../../components/Placeholder';
import { PlusIcon } from '../../crm/components/Icons';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';

const initialUsers = [
    { id: 1, name: 'Admin User', email: 'admin@system.io', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Connor', email: 's.connor@system.io', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Kyle Reese', email: 'k.reese@system.io', role: 'User', status: 'Active' },
    { id: 4, name: 'John Anderton', email: 'j.anderton@system.io', role: 'User', status: 'Invited' },
];

const roleClasses = {
    Admin: 'bg-purple-500/30 text-purple-300',
    Manager: 'bg-cyan-500/30 text-cyan-300',
    User: 'bg-gray-500/30 text-gray-300',
};

const statusClasses = {
    Active: 'bg-green-500/30 text-green-300',
    Invited: 'bg-yellow-500/30 text-yellow-300',
};

const AllUsersContent: React.FC = () => {
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = React.useMemo(() => 
        users.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        ), [users, searchQuery]);

    return (
         <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow">
                    <PlusIcon className="w-5 h-5"/>
                    Invite User
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                 <div className="relative mb-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search users..."
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
                                {['Name', 'Email', 'Role', 'Status', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{user.name}</td>
                                    <td className="p-3 text-gray-400">{user.email}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${roleClasses[user.role]}`}>{user.role}</span></td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[user.status]}`}>{user.status}</span></td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};


const Users: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsUsersSection>('All Users');
    
    const renderContent = () => {
        switch(activeL3Section) {
            case 'All Users': return <AllUsersContent />;
            case 'Roles & Permissions':
            case 'Invitations':
                return <Placeholder sectionName={activeL3Section} />;
            default: return <AllUsersContent />;
        }
    };

    return (
       <div className="flex h-full">
            <SystemSettingsL3Sidebar 
                activeL2Section="Users" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default Users;
