
import React from 'react';
import { MarketplaceSection } from '../../../types';
import { MarketplaceL3Section } from '../types';
import { MARKETPLACE_L3_MAP } from '../../../constants';
import * as Icons from './Icons';

interface MarketplaceL2SidebarProps {
    activeL2Section: MarketplaceSection;
    activeL3Section: MarketplaceL3Section | null;
    setActiveL3Section: (section: MarketplaceL3Section | null) => void;
}

const NavItem: React.FC<{ icon: React.FC<{ className?: string }>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 my-1
        ${active ? 'bg-white/20 text-cyber-cyan' : 'hover:bg-white/10 text-white'}`}
    >
        <Icon className="h-6 w-6 mb-1" />
        <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

// Placeholder icon mapping for L3 sections
const iconMap: Record<string, React.FC<{ className?: string }>> = {
    // All
    'Featured': Icons.TopChartsIcon,
    'New Arrivals': Icons.CategoriesIcon,
    'Popular': Icons.SubscriptionsIcon,
    // Electronics
    'Accessories & Supplies': Icons.AccessoriesIcon,
    'Camera & Photo': Icons.CameraIcon,
    'Car & Vehicle Electronics': Icons.CarIcon,
    'Cell Phones & Accessories': Icons.PhoneIcon,
    'Computers & Accessories': Icons.ComputerIcon,
    'GPS & Navigation': Icons.GpsIcon,
    'Headphones': Icons.HeadphonesIcon,
    'Home Audio': Icons.HomeAudioIcon,
    'Office Electronics': Icons.OfficeIcon,
    'Portable Audio & Video': Icons.PortableAudioIcon,
    'Security & Surveillance': Icons.SecurityIcon,
    'Service Plans': Icons.CategoriesIcon, // placeholder
    'Television & Video': Icons.TvIcon,
    'Video Game Consoles': Icons.GamepadIcon,
    'Video Projectors': Icons.ProjectorIcon,
    'Wearable Technology': Icons.WatchIcon,
    // Add more if needed, otherwise default
};

const MarketplaceL2Sidebar: React.FC<MarketplaceL2SidebarProps> = ({ activeL2Section, activeL3Section, setActiveL3Section }) => {
    const navItems = MARKETPLACE_L3_MAP[activeL2Section] || [];

    if (navItems.length === 0) {
        return null; // Don't render a sidebar if there are no sub-categories
    }

    return (
        <aside className="w-24 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full bg-black/20 border-r border-cyber-border">
            <nav className="w-full overflow-y-auto pr-1">
                {navItems.map(section => (
                    <NavItem
                        key={section as string}
                        icon={iconMap[section as string] || Icons.CategoriesIcon}
                        label={section as string}
                        active={activeL3Section === section}
                        onClick={() => setActiveL3Section(section as MarketplaceL3Section)}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default MarketplaceL2Sidebar;
