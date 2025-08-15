import React from 'react';
import * as Icons from '../../student/components/Icons';

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
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

const iconMap = {
    'School Directory': Icons.DashboardIcon,
    'Colleges': Icons.BrainIcon,
    'Departments': Icons.ResourcesIcon,
    'Courses': Icons.CoursesIcon,
    'Staff Directory': Icons.ProfileIcon,
    'Academic Calendar': Icons.CalendarIcon,
    'Campus Map': Icons.GlobeIcon,
    'Facilities': Icons.BookingIcon,
    'Resources': Icons.ResourcesIcon,
    'Policies': Icons.PolicyIcon,
    'Emergency Info': Icons.AlertIcon,
    'Contact Info': Icons.CommunicationIcon,
};

const SchoolL2Sidebar: React.FC<{ activeItem: string, setActiveItem: (id: string) => void, navItems: {id: string, label: string}[] }> = ({ activeItem, setActiveItem, navItems }) => {
    
    return (
        <aside className="w-32 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-cyber-purple/30 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col">
                <nav className="w-full flex flex-col gap-1 max-h-full">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={iconMap[item.label] || Icons.DefaultIcon}
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

export default SchoolL2Sidebar;