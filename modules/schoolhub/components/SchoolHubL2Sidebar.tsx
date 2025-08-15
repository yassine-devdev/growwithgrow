
import React, { useState } from 'react';
import { SchoolIcon, StudentIcon, ParentIcon, TeacherIcon, AdminIcon, FinanceIcon, MarketingIcon } from './Icons';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 my-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-6 w-6 text-white mb-1" />
        <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

const SchoolHubL2Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('school');
    const navItems = [
        { id: 'school', icon: SchoolIcon, label: 'School' },
        { id: 'student', icon: StudentIcon, label: 'Student' },
        { id: 'parent', icon: ParentIcon, label: 'Parent' },
        { id: 'teacher', icon: TeacherIcon, label: 'Teacher' },
        { id: 'admin', icon: AdminIcon, label: 'Admin' },
        { id: 'finance', icon: FinanceIcon, label: 'Finance' },
        { id: 'marketing', icon: MarketingIcon, label: 'Marketing' }
    ];

    return (
        <aside className="w-32 flex-shrink-0 flex flex-col items-center justify-start pt-8 px-2">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col">
                <nav className="w-full flex flex-col gap-1 max-h-full">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeItem === item.id}
                            onClick={() => setActiveItem(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SchoolHubL2Sidebar;