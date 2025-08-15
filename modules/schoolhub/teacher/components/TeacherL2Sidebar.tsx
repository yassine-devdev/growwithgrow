
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
    'Staff Store': Icons.ShopIcon,
    'Conference Accommodation': Icons.BookingIcon,
    'Professional Car Rentals': Icons.TransportIcon,
    'Classroom Maintenance': Icons.WrenchIcon,
    'Professional Concierge': Icons.AssistantIcon,
    'Educational Media': Icons.MediaIcon,
    'Islamic Resources': Icons.JournalIcon,
    'AI Classroom Insights': Icons.InsightIcon,
    'Smart Gap Detector': Icons.PathIcon,
    'Auto-Remediation Plans': Icons.CheckboxIcon,
    'Customized Learning Content': Icons.LightbulbIcon,
    'AI-Assisted Grading': Icons.AIIcon,
    'Learning Target Tracker': Icons.GoalIcon,
    'Behavior Dashboard': Icons.AnalyticsIcon,
    'IEP/504 Plan Integration': Icons.PolicyIcon,
    'Assessment Builder': Icons.ToolsIcon,
    'Resource Hub': Icons.ResourcesIcon,
    'Real-Time Collaboration': Icons.CommunityIcon,
    'AI Exam Generator': Icons.ProctoringIcon,
    'Automated Feedback Analysis': Icons.FeedbackIcon,
    'Interactive Classroom Tools': Icons.VrIcon,
    'Peer Feedback': Icons.FeedbackIcon,
    'Teacher Wellness': Icons.WellnessIcon,
    'Substitute Teacher Portal': Icons.PortfolioIcon,
    'Global Teacher Collaboration': Icons.GlobalIcon,
};


const TeacherL2Sidebar: React.FC<{ activeItem: string, setActiveItem: (id: string) => void, navItems: {id: string, label: string}[] }> = ({ activeItem, setActiveItem, navItems }) => {
    
    return (
        <aside className="w-32 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-purple-800 rounded-2xl p-2 shadow-lg w-full h-full flex flex-col">
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

export default TeacherL2Sidebar;