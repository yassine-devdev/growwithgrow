
import React from 'react';
import { KnowledgeBaseStoreSection, KnowledgeBaseStoreL4Section } from '../types';
import { KNOWLEDGE_BASE_STORE_L4_MAP } from '../../../constants';
import * as Icons from './Icons';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';
import { ReportsIcon } from '../../dashboard/components/Icons';

interface StoreL4SidebarProps {
    activeL3: KnowledgeBaseStoreSection;
    activeL4: KnowledgeBaseStoreL4Section | null;
    setActiveL4: (section: KnowledgeBaseStoreL4Section) => void;
}

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[60px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-5 w-5 text-white" />
        <span className="text-white text-[10px] font-medium leading-tight text-center mt-1">{label}</span>
    </button>
);

const iconMap: Record<string, React.FC<{className?: string}>> = {
    // Books
    "Search": SearchIcon,
    "Filter": Icons.FilterIcon,
    "Categories": Icons.CategoriesIcon,
    "View Details": Icons.DetailsIcon,
    // Courses
    "View Syllabus": Icons.SyllabusIcon,
    "Enroll": Icons.EnrollIcon,
    // Exams
    "Practice Tests": Icons.PracticeTestIcon,
    "Timed Exams": Icons.TimedExamIcon,
    "Results": ReportsIcon,
    "Difficulty": Icons.DifficultyIcon,
};

const StoreL4Sidebar: React.FC<StoreL4SidebarProps> = ({ activeL3, activeL4, setActiveL4 }) => {
    const navItems = KNOWLEDGE_BASE_STORE_L4_MAP[activeL3] || [];
    
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start h-full">
            <div className="bg-[#ca8a04] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {navItems.map(section => (
                         <NavItem 
                            key={section}
                            icon={iconMap[section || ''] || Icons.BookmarksIcon}
                            label={section || ''}
                            active={activeL4 === section}
                            onClick={() => setActiveL4(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};
export default StoreL4Sidebar;
