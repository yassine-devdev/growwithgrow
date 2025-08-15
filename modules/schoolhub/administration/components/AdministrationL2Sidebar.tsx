
import React from 'react';
import * as Icons from '../../student/components/Icons'; // Re-use the comprehensive icon set

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
    'Central Procurement Hub': Icons.ProcurementIcon,
    'Accommodation & Car Rental': Icons.BookingIcon,
    'Maintenance Management': Icons.WrenchIcon,
    'Concierge Coordination': Icons.AssistantIcon,
    'Strategic Analytics': Icons.AnalyticsIcon,
    'Media & Islamic Resources': Icons.MediaIcon,
    'Real-Time Approvals': Icons.CheckboxIcon,
    'Vendor Notifications': Icons.AlertIcon,
    'Departmental Tracking': Icons.PathIcon,
    'Live Transport Monitoring': Icons.TransportIcon,
    'Facility Efficiency': Icons.EnergyIcon,
    'Smart Scheduling': Icons.CalendarIcon,
    'Resource Booking': Icons.BookingIcon,
    'Incident Report Management': Icons.JournalIcon,
    'Digital Twin Campus': Icons.VrIcon,
    'AI Traffic Optimization': Icons.AIIcon,
    'Master Event Calendar': Icons.EventIcon,
    'Safety Compliance': Icons.SafetyIcon,
    'Space Utilization': Icons.InsightIcon,
    'Smart Inventory': Icons.InventoryIcon,
    'Energy Management': Icons.EnergyIcon,
};


const AdministrationL2Sidebar: React.FC<{ activeItem: string, setActiveItem: (id: string) => void, navItems: {id: string, label: string}[] }> = ({ activeItem, setActiveItem, navItems }) => {
    
    return (
        <aside className="w-32 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-slate-700 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col">
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

export default AdministrationL2Sidebar;