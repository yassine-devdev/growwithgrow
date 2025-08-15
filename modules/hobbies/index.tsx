import React, { useState, useMemo, useEffect } from 'react';
import { HOBBY_DATA } from '../../constants';
import { HobbiesSection } from './types';
import GlassCard from '../../components/GlassCard';
import { generateHobbyInfo } from '../../services/geminiService';
import { DefaultHobbyIcon, PerformingArtsIcon, WritingIcon, OutdoorsIcon, ArtsCraftsIcon, CollectingIcon } from './components/CategoryIcons';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-full text-cyber-cyan">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 font-semibold animate-pulse">Generating hobby guide...</p>
    </div>
);

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
          ? 'bg-lime-300/20 text-lime-300'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
      <span className="text-[10px] font-medium text-center leading-tight truncate w-full px-1">{label}</span>
    </button>
);

interface HobbiesProps {
    activeCategory: HobbiesSection;
}

const Hobbies: React.FC<HobbiesProps> = ({ activeCategory }) => {
    const [activeHobby, setActiveHobby] = useState<string | null>(null);
    const [hobbyInfo, setHobbyInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchHobbyInfo = async () => {
            if (!activeHobby) return;
            setIsLoading(true);
            setError(null);
            setHobbyInfo(null);
            try {
                const data = await generateHobbyInfo(activeHobby);
                setHobbyInfo(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load hobby information.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHobbyInfo();
    }, [activeHobby]);

    useEffect(() => {
        const items = HOBBY_DATA.find(data => data.category === activeCategory)?.items || [];
        setActiveHobby(items[0] || null);
    }, [activeCategory]);

    const hobbyItems = useMemo(() => {
        if (!activeCategory) return [];
        return HOBBY_DATA.find(data => data.category === activeCategory)?.items || [];
    }, [activeCategory]);

    const categoryIcon = useMemo(() => {
        switch (activeCategory) {
            case 'Performing Arts': return PerformingArtsIcon;
            case 'Writing and Literature': return WritingIcon;
            case 'Outdoor Activities': return OutdoorsIcon;
            case 'Arts and Crafts': return ArtsCraftsIcon;
            case 'Collecting': return CollectingIcon;
            default: return DefaultHobbyIcon;
        }
    }, [activeCategory]);

    return (
        <div className="h-full flex text-white overflow-hidden">
            <aside className="w-[90px] flex-shrink-0 bg-black/20 p-2 border-r border-cyber-border flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 w-full">
                    {hobbyItems.map(item => (
                        <ToolButton
                            key={item}
                            label={item}
                            icon={categoryIcon}
                            isActive={activeHobby === item}
                            onClick={() => setActiveHobby(item)}
                        />
                    ))}
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <GlassCard className="p-8 h-full">
                    {isLoading && <LoadingSpinner />}
                    {error && <div className="text-center text-red-400 p-4">{error}</div>}
                    {!isLoading && !error && hobbyInfo && activeHobby && (
                        <div>
                            <h2 className="text-3xl font-bold text-cyber-cyan mb-4">{activeHobby}</h2>
                            <p className="text-gray-300 leading-relaxed mb-6">{hobbyInfo.introduction}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-lime-300 mb-3">Getting Started</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                                        {hobbyInfo.gettingStartedTips.map((tip: string, index: number) => <li key={index}>{tip}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h3 className="text-xl font-semibold text-lime-300 mb-3">Beginner Projects</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                                        {hobbyInfo.projectIdeas.map((idea: string, index: number) => <li key={index}>{idea}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && !hobbyInfo && (
                         <div className="flex items-center justify-center h-full text-gray-500 font-mono">
                            <p>Select a hobby to see an AI-generated guide.</p>
                        </div>
                    )}
                </GlassCard>
            </main>
        </div>
    );
};

export default Hobbies;
