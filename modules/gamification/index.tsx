



import React, { useState, useMemo, useEffect } from 'react';
import AIChartCard from '../../components/AIChartCard';
import { GamificationSection } from './types';
import { GAMIFICATION_DATA } from '../../constants';
import * as ToolIcons from './components/ToolIcons';

interface GamificationProps {
    activeCategory: string;
}

const ToolButton: React.FC<{
  label: string;
  icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      title={label}
      className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-1
        ${isActive
          ? 'bg-yellow-400/20 text-yellow-300'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);

const toolIcons: Record<string, React.FC<{ className?: string }>> = {
    'Profile': ToolIcons.ProfileIcon,
    'Leaderboards': ToolIcons.LeaderboardsIcon,
    'Achievements': ToolIcons.AchievementsIcon,
};

const PlaceholderSection: React.FC<{ sectionName: string }> = ({ sectionName }) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 font-mono text-lg">Content for {sectionName} will be here.</p>
    </div>
);

const LeaderboardsContent: React.FC = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
        <AIChartCard 
            title="Player Motivation Types"
            prompt="Create a pie chart for player motivation based on Bartle's taxonomy: Achievers 20%, Explorers 30%, Socializers 40%, Killers 10%."
            className="flex-grow"
        />
        <AIChartCard 
            title="Daily Quest Completion Rate"
            prompt="Create a bar chart showing daily quest completion rate for the last 5 days: Day 1 85%, Day 2 88%, Day 3 92%, Day 4 80%, Day 5 95%."
            className="flex-grow"
        />
    </div>
);


const Gamification: React.FC<GamificationProps> = ({ activeCategory }) => {
    const [activeTool, setActiveTool] = useState<GamificationSection | null>(() => {
        const items = GAMIFICATION_DATA.find(data => data.category === activeCategory)?.items || [];
        return items[0] as GamificationSection || null;
    });

    useEffect(() => {
        const items = GAMIFICATION_DATA.find(data => data.category === activeCategory)?.items || [];
        setActiveTool(items[0] as GamificationSection || null);
    }, [activeCategory]);
    
    const toolItems = useMemo(() => {
        return GAMIFICATION_DATA.find(data => data.category === activeCategory)?.items || [];
    }, [activeCategory]);
    
    const renderContent = () => {
        switch (activeTool) {
            case 'Profile':
                return <PlaceholderSection sectionName="Profile" />;
            case 'Achievements':
                return <PlaceholderSection sectionName="Achievements" />;
            case 'Leaderboards':
                return <LeaderboardsContent />;
            default:
                 return <PlaceholderSection sectionName="Gamification" />;
        }
    };

    return (
        <div className="h-full flex text-white overflow-hidden">
            <aside className="w-[90px] flex-shrink-0 bg-black/20 p-2 border-r border-cyber-border flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 w-full">
                    {toolItems.map(item => {
                        const Icon = toolIcons[item] || ToolIcons.DefaultIcon;
                         return (
                            <ToolButton
                                key={item}
                                label={item}
                                icon={Icon}
                                isActive={activeTool === item}
                                onClick={() => setActiveTool(item as GamificationSection)}
                            />
                        )
                    })}
                </div>
            </aside>

            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto min-w-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default Gamification;
