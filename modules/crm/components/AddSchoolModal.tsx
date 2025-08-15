import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { CloseIcon } from './Icons';
import { School } from '../../../types';

interface AddSchoolModalProps {
    onClose: () => void;
    onAddSchool: (school: Omit<School, 'id'>) => void;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool }) => {
    const [name, setName] = useState('');
    const [admin, setAdmin] = useState('');
    const [students, setStudents] = useState(0);
    const [plan, setPlan] = useState<'Basic' | 'Pro' | 'Enterprise'>('Basic');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && admin) {
            onAddSchool({ name, admin, students, plan, status: 'Trial' });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <GlassCard className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">Onboard New School</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">School Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                    </div>
                    <div>
                        <label htmlFor="admin" className="block text-sm font-medium text-gray-300 mb-1">Administrator Name</label>
                        <input type="text" id="admin" value={admin} onChange={e => setAdmin(e.target.value)} required className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="students" className="block text-sm font-medium text-gray-300 mb-1">Number of Students</label>
                            <input type="number" id="students" value={students} onChange={e => setStudents(Number(e.target.value))} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
                        </div>
                        <div>
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-300 mb-1">Subscription Plan</label>
                            <select id="plan" value={plan} onChange={e => setPlan(e.target.value as any)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple">
                                <option>Basic</option>
                                <option>Pro</option>
                                <option>Enterprise</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyber-purple text-white font-bold hover:shadow-glow-purple transition-shadow">Add School</button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddSchoolModal;
