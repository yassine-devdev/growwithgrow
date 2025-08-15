

import React, { useState, useMemo } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import { SearchIcon } from '../../../../components/icons/InterfaceIcons';
import AddCompanyModal from '../../components/AddCompanyModal';
import { Company, Contact } from '../../../../types';
import CompanyDetailModal from '../../components/CompanyDetailModal';

const initialCompanies: Company[] = [
    { id: 1, name: 'CyberCorp', owner: 'John Doe', industry: 'Technology', city: 'Night City', country: 'USA' },
    { id: 2, name: 'OmniCorp', owner: 'Jane Smith', industry: 'Conglomerate', city: 'Detroit', country: 'USA' },
    { id: 3, name: 'Weyland-Yutani', owner: 'Deckard Cain', industry: 'Bio-Technology', city: 'Tokyo', country: 'Japan' },
    { id: 4, name: 'Tyrell Corp', owner: 'Rachael Tyrell', industry: 'Robotics', city: 'Los Angeles', country: 'USA' },
];

// Dummy contacts for modal
const allContacts: Contact[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@cybercorp.com', company: 'CyberCorp', phone: '555-0101', leadStatus: 'Qualified', owner: 'Admin User', activities: [], deals: [] },
    { id: 2, name: 'Jane Smith', email: 'jane.s@omnicorp.com', company: 'OmniCorp', phone: '555-0102', leadStatus: 'Contacted', owner: 'Sarah Connor', activities: [], deals: [] },
    { id: 4, name: 'Rachael Tyrell', email: 'rachael@tyrell.io', company: 'Tyrell Corp', phone: '555-0104', leadStatus: 'Qualified', owner: 'Admin User', activities: [], deals: [] },
];


const AllCompanies: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => 
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.industry.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [companies, searchQuery]);
    
    const handleAddCompany = (company: Omit<Company, 'id'>) => {
        const newCompany = { ...company, id: Date.now() };
        setCompanies(prev => [newCompany, ...prev]);
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Companies</h2>
                    <p className="text-gray-400">Manage your company records.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Company
                </button>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                 <div className="relative mb-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search companies..."
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
                                {['Company Name', 'Owner', 'Industry', 'Location', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {filteredCompanies.map(company => (
                                <tr key={company.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{company.name}</td>
                                    <td className="p-3 text-gray-400">{company.owner}</td>
                                    <td className="p-3 text-gray-400">{company.industry}</td>
                                    <td className="p-3 text-gray-400">{company.city}, {company.country}</td>
                                    <td className="p-3 text-right"><button onClick={() => setSelectedCompany(company)} className="font-medium text-cyber-cyan hover:underline">Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            {isModalOpen && <AddCompanyModal onClose={() => setIsModalOpen(false)} onAddCompany={handleAddCompany} />}
            {selectedCompany && <CompanyDetailModal company={selectedCompany} allContacts={allContacts} onClose={() => setSelectedCompany(null)} />}
        </div>
    );
};

export default AllCompanies;
