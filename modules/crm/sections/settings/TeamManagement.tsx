

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import AddTeamMemberModal from '../../components/AddTeamMemberModal';
import { TeamMember } from '../../../../types';

const initialTeamMembers: TeamMember[] = [
    { id: 1, name: 'Admin User', email: 'admin@system.io', role: 'Admin' },
    { id: 2, name: 'Sarah Connor', email: 's.connor@system.io', role: 'Manager' },
    { id: 3, name: 'Kyle Reese', email: 'k.reese@system.io', role: 'Sales Rep' },
];

const roleClasses = {
    Admin: 'bg-purple-500/30 text-purple-300',
    Manager: 'bg-cyan-500/30 text-cyan-300',
    'Sales Rep': 'bg-gray-500/30 text-gray-300',
};

const TeamManagement: React.FC = () => {
    const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddMember = (member: Omit<TeamMember, 'id'>) => {
        const newMember = { ...member, id: Date.now() };
        setTeam(prev => [...prev, newMember]);
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Team Management</h2>
                    <p className="text-gray-400">Manage users and their roles in the CRM.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Member
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-left">
                        <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                            <tr>
                                {['Name', 'Email', 'Role', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {team.map(member => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{member.name}</td>
                                    <td className="p-3 text-gray-400">{member.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${roleClasses[member.role]}`}>{member.role}</span>
                                    </td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            {isModalOpen && <AddTeamMemberModal onClose={() => setIsModalOpen(false)} onAddMember={handleAddMember} />}
        </div>
    );
};

export default TeamManagement;
