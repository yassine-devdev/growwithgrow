
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';
import { TeamMember } from '../../../types';

interface AddTeamMemberModalProps {
    onClose: () => void;
    onAddMember: (member: Omit<TeamMember, 'id'>) => void;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ onClose, onAddMember }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamMember['role']>('Sales Rep');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            onAddMember({ name, email, role });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <GlassCard className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
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
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as any)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple">
                            <option>Sales Rep</option>
                            <option>Manager</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyber-purple text-white font-bold hover:shadow-glow-purple transition-shadow">Add Member</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddTeamMemberModal;
