import React from 'react';
import { KnowledgeBaseSection } from '../types';
import { BookOpenText, ClipboardList, Library, Search, Store } from 'lucide-react';

interface NavItemProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon size={24} className="text-white mb-1" />
        <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

interface KnowledgeBaseL2SidebarProps {
    activeSection: KnowledgeBaseSection;
    setActiveSection: (section: KnowledgeBaseSection) => void;
}

const KnowledgeBaseL2Sidebar: React.FC<KnowledgeBaseL2SidebarProps> = ({ activeSection, setActiveSection }) => {
    const navItems = [
        { id: 'Curriculum' as KnowledgeBaseSection, icon: BookOpenText, label: 'Curriculum' },
        { id: 'Assessments' as KnowledgeBaseSection, icon: ClipboardList, label: 'Assessments' },
        { id: 'Library' as KnowledgeBaseSection, icon: Library, label: 'Library' },
        { id: 'AI Search' as KnowledgeBaseSection, icon: Search, label: 'AI Search' },
        { id: 'Store' as KnowledgeBaseSection, icon: Store, label: 'Store' },
    ];

    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-8 px-2">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg">
                <nav className="w-full flex flex-col gap-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeSection === item.id}
                            onClick={() => setActiveSection(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default KnowledgeBaseL2Sidebar;