


import React, { useState, useMemo, useEffect } from 'react';
import AIChartCard from '../../components/AIChartCard';
import { LeisureSection } from './types';
import { LEISURE_DATA } from '../../constants';
import * as ToolIcons from './components/ToolIcons';

interface LeisureProps {
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
          ? 'bg-sky-400/20 text-sky-300'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);

const toolIcons: Record<string, React.FC<{ className?: string }>> = {
    'Watchlist': ToolIcons.WatchlistIcon,
    'My Reviews': ToolIcons.ReviewsIcon,
    'Recommendations': ToolIcons.RecommendationsIcon,
};

const PlaceholderSection: React.FC<{ sectionName: string }> = ({ sectionName }) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 font-mono text-lg">Content for {sectionName} will be here.</p>
    </div>
);

const RecommendationsContent: React.FC = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
        <AIChartCard 
            title="Leisure Time Allocation"
            prompt="Create a pie chart for how leisure time is spent: Movies & TV 40%, Listening to Music 25%, Visiting Parks 15%, Restaurants 15%, Other 5%."
            className="flex-grow"
        />
        <AIChartCard 
            title="Vacation Destination Popularity"
            prompt="Create a bar chart for vacation destination popularity. Beach Resorts 5000 votes, Mountain Cabins 3500 votes, City Tours 4200 votes, Cruises 2800 votes."
            className="flex-grow"
        />
    </div>
);


const Leisure: React.FC<LeisureProps> = ({ activeCategory }) => {
    const [activeTool, setActiveTool] = useState<LeisureSection | null>(() => {
        const items = LEISURE_DATA.find(data => data.category === activeCategory)?.items || [];
        return items[0] as LeisureSection || null;
    });

    useEffect(() => {
        const items = LEISURE_DATA.find(data => data.category === activeCategory)?.items || [];
        setActiveTool(items[0] as LeisureSection || null);
    }, [activeCategory]);
    
    const toolItems = useMemo(() => {
        return LEISURE_DATA.find(data => data.category === activeCategory)?.items || [];
    }, [activeCategory]);
    
    const renderContent = () => {
        switch (activeTool) {
            case 'Watchlist':
                return <PlaceholderSection sectionName="Watchlist" />;
            case 'My Reviews':
                return <PlaceholderSection sectionName="My Reviews" />;
            case 'Recommendations':
                return <RecommendationsContent />;
            default:
                return <PlaceholderSection sectionName="Leisure" />;
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
                                onClick={() => setActiveTool(item as LeisureSection)}
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

export default Leisure;
