
import React from 'react';
import * as Icons from './Icons';

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
    'AI Learning Guide': Icons.LightbulbIcon,
    'Learning Pathways': Icons.PathIcon,
    'Learning Style Analyzer': Icons.BrainIcon,
    'Gamified Growth Map': Icons.GamepadIcon,
    'School Token Economy': Icons.CoinIcon,
    'Goal Trees': Icons.GoalIcon,
    'Calendar & To-Do': Icons.CalendarIcon,
    'Personal Growth Journal': Icons.JournalIcon,
    'Mood + Focus Check-In': Icons.HeartIcon,
    'Mindfulness Tools': Icons.WellnessIcon,
    'Study Playlist Generator': Icons.MusicIcon,
    'AI Student Life Mentor': Icons.AssistantIcon,
    'Skills Credentialing': Icons.BadgeIcon,
    'Universal Portfolio': Icons.PortfolioIcon,
    'AI Creative Assistant': Icons.AIIcon,
    'News & Opportunity Feed': Icons.NewsIcon,
    'Digital Citizenship': Icons.ShieldIcon,
    'World Classroom': Icons.GlobeIcon,
    'Peer-to-Peer Communities': Icons.CommunityIcon,
    'Global Learning Hub': Icons.GlobalIcon,
    'Immersive AR/VR': Icons.VrIcon,
    'Social Impact Simulator': Icons.CommunityIcon,
    'Project Marketplace': Icons.ShopIcon,
    'Language Chatbots': Icons.LanguageIcon,
    'Growth Analytics': Icons.AnalyticsIcon,
    'Emergency Notifications': Icons.AlertIcon,
    'AI Virtual Study Assistant': Icons.AssistantIcon,
};


const StudentL2Sidebar: React.FC<{ activeItem: string, setActiveItem: (id: string) => void, navItems: {id: string, label: string}[] }> = ({ activeItem, setActiveItem, navItems }) => {
    
    return (
        <aside className="w-32 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#3A9E8A] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col">
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

export default StudentL2Sidebar;