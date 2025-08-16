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
        className={`relative w-full h-[70px] flex flex-col items-center justify-center rounded-xl transition-all duration-300 p-1 group overflow-hidden
        ${active 
            ? 'bg-gradient-to-br from-cyber-purple/40 to-cyber-cyan/20 shadow-glow-purple border border-cyber-purple/30' 
            : 'hover:bg-gradient-to-br hover:from-white/10 hover:to-cyber-purple/5 hover:shadow-glow-purple/30 border border-transparent hover:border-cyber-purple/20'
        }`}
    >
        {/* Active indicator line */}
        {active && (
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyber-cyan to-cyber-purple rounded-r-full shadow-glow-cyan" />
        )}
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
        } bg-gradient-to-br from-cyber-purple/20 to-cyber-cyan/10`} />
        
        {/* Icon with enhanced styling */}
        <div className={`relative z-10 transition-all duration-300 ${
            active ? 'scale-110' : 'group-hover:scale-105'
        }`}>
            <Icon size={24} className={`mb-1 transition-all duration-300 ${
                active ? 'text-cyber-cyan drop-shadow-glow-cyan' : 'text-white group-hover:text-cyber-purple'
            }`} />
        </div>
        
        {/* Label with enhanced typography */}
        <span className={`relative z-10 text-[10px] font-semibold leading-tight text-center transition-all duration-300 ${
            active ? 'text-cyber-cyan' : 'text-white/80 group-hover:text-white'
        }`}>{label}</span>
        
        {/* Subtle pulse animation for active state */}
        {active && (
            <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-br from-cyber-purple/10 to-cyber-cyan/5" />
        )}
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
            <div className="relative bg-gradient-to-b from-cyber-purple/20 to-cyber-cyan/10 rounded-2xl p-2 shadow-glow-purple/20 border border-cyber-purple/20 backdrop-blur-sm">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyber-purple/5 to-transparent opacity-50" />
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
                
                <nav className="relative z-10 w-full flex flex-col gap-2">
                    {navItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={activeSection === item.id}
                                onClick={() => setActiveSection(item.id)}
                            />
                        </div>
                    ))}
                </nav>
                
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyber-purple/20 via-cyber-cyan/10 to-cyber-purple/20 opacity-30 blur-sm" />
            </div>
        </aside>
    );
};

export default KnowledgeBaseL2Sidebar;