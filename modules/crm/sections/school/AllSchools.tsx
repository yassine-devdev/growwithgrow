
import React, { useMemo, useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import { SearchIcon } from '../../../../components/icons/InterfaceIcons';
import { School } from '../../../../types';

interface AllSchoolsProps {
    schools: School[];
    setSchools: React.Dispatch<React.SetStateAction<School[]>>;
    onAddSchoolClick: () => void;
}

const statusClasses = {
    Active: 'bg-green-500/30 text-green-300',
    Inactive: 'bg-gray-500/30 text-gray-400',
    Trial: 'bg-yellow-500/30 text-yellow-300',
};

const planClasses = {
    Basic: 'border-stone-400 text-stone-300',
    Pro: 'border-cyan-400 text-cyan-300',
    Enterprise: 'border-purple-400 text-purple-300',
};

const AllSchools: React.FC<AllSchoolsProps> = ({ schools, onAddSchoolClick }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSchools = useMemo(() => {
        return schools.filter(school => 
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.admin.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [schools, searchQuery]);

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">School Management</h2>
                    <p className="text-gray-400">Oversee all schools on the platform.</p>
                </div>
                <button 
                    onClick={onAddSchoolClick}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add School
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                 <div className="relative mb-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search schools..."
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
                                {['School Name', 'Administrator', 'Status', 'Students', 'Plan', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {filteredSchools.map(school => (
                                <tr key={school.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{school.name}</td>
                                    <td className="p-3 text-gray-400">{school.admin}</td>
                                     <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[school.status]}`}>{school.status}</span>
                                    </td>
                                    <td className="p-3 text-gray-400 font-mono">{school.students.toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${planClasses[school.plan]}`}>{school.plan}</span>
                                    </td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Manage</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default AllSchools;
