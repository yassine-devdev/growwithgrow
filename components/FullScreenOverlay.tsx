

import React, { useState, useEffect } from 'react';
import { ModuleType, ModuleSection } from '../types';
import { LeisureLifestyleSection } from '../modules/lifestyle/types';
import { HobbiesSection } from '../modules/hobbies/types';
import { LeisureSection } from '../modules/leisure/types';
import { GamificationSection } from '../modules/gamification/types';
import { MediaSection } from '../modules/media/types';
import { StudioSection } from '../modules/studio/types';
import { MarketplaceSection } from '../modules/marketplace/types';

import { MODULES, MODULE_SECTIONS, HOBBY_DATA, GAMIFICATION_DATA, LEISURE_DATA, LEISURE_LIFESTYLE_SECTIONS } from '../constants';
import GlassCard from './GlassCard';
import { CloseIcon, MinimizeIcon } from './icons/WindowIcons';

import LeisureLifestyle from '../modules/lifestyle/index';
import Hobbies from '../modules/hobbies/index';
import Leisure from '../modules/leisure/index';
import Gamification from '../modules/gamification/index';
import Media from '../modules/media/index';
import Studio from '../modules/studio/index';
import Marketplace from '../modules/marketplace/index';

interface FullScreenOverlayProps {
  activeOverlay: ModuleType | null;
  onClose: () => void;
  onReduce: () => void;
}

const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ activeOverlay, onClose, onReduce }) => {
    const moduleInfo = activeOverlay ? MODULES.find(m => m.id === activeOverlay) : null;
    
    const [activeSection, setActiveSection] = useState<ModuleSection | null>(null);
    const [activeLeisureLifestyleSection, setActiveLeisureLifestyleSection] = useState<LeisureLifestyleSection>(LEISURE_LIFESTYLE_SECTIONS[0]);
    const [activeHobbyCategory, setActiveHobbyCategory] = useState<HobbiesSection>(HOBBY_DATA[0].category);
    const [activeGamificationCategory, setActiveGamificationCategory] = useState<string>(GAMIFICATION_DATA[0].category);
    const [activeLeisureCategory, setActiveLeisureCategory] = useState<string>(LEISURE_DATA[0].category);

    useEffect(() => {
        if (activeOverlay) {
            const newSections = MODULE_SECTIONS[activeOverlay] || [];
            setActiveSection(newSections[0] || null);
        }
    }, [activeOverlay]);
    
    useEffect(() => {
        if (activeOverlay === ModuleType.LeisureLifestyle) {
            setActiveLeisureLifestyleSection(LEISURE_LIFESTYLE_SECTIONS[0]);
        }
    }, [activeOverlay]);


    if (!activeOverlay || !moduleInfo) return null;

    const renderContent = () => {
        switch (activeOverlay) {
            case ModuleType.LeisureLifestyle: return <LeisureLifestyle activeSection={activeLeisureLifestyleSection} />;
            case ModuleType.Hobbies: return <Hobbies activeCategory={activeHobbyCategory} />;
            case ModuleType.Leisure: return <Leisure activeCategory={activeLeisureCategory} />;
            case ModuleType.Gamification: return <Gamification activeCategory={activeGamificationCategory} />;
            case ModuleType.Media: return <Media />;
            case ModuleType.Studio: return <Studio />;
            case ModuleType.Marketplace: return <Marketplace activeSection={activeSection as MarketplaceSection} />;
            default: return <div className="p-8 text-white">Module not found</div>;
        }
    };
    
    const isFullBleed = [
      ModuleType.LeisureLifestyle, 
      ModuleType.Hobbies, 
      ModuleType.Studio, 
      ModuleType.Media,
      ModuleType.Gamification,
      ModuleType.Leisure,
    ].includes(activeOverlay);

  return (
    <div 
        className="fixed inset-0 z-40 bg-cyber-bg/90 backdrop-blur-md flex p-4 animate-fade-in"
    >
        <GlassCard className="w-full h-full flex flex-col">
            <header className={`h-14 bg-black/30 flex-shrink-0 flex items-center justify-between px-4 border-b border-cyber-border`}>
                <div className="flex items-center gap-3">
                    <moduleInfo.icon className="w-6 h-6 text-cyber-purple" />
                    <h2 className="font-bold text-white text-lg">{moduleInfo.title}</h2>
                </div>
                
                <div className="flex-1 flex justify-center">
                   {activeOverlay === ModuleType.LeisureLifestyle && (
                        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-cyber-border overflow-x-auto">
                            {LEISURE_LIFESTYLE_SECTIONS.map((section) => (
                                <button key={section} onClick={() => setActiveLeisureLifestyleSection(section)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${ activeLeisureLifestyleSection === section ? 'bg-cyber-purple/20 text-cyber-purple shadow-glow-purple' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    {section}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeOverlay === ModuleType.Hobbies && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-cyber-border">
                            {HOBBY_DATA.map(({ category }) => (
                                <button key={category} onClick={() => setActiveHobbyCategory(category)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${ activeHobbyCategory === category ? 'bg-lime-400/20 text-lime-300 shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeOverlay === ModuleType.Gamification && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-cyber-border">
                            {GAMIFICATION_DATA.map(({ category }) => (
                                <button key={category} onClick={() => setActiveGamificationCategory(category)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${ activeGamificationCategory === category ? 'bg-yellow-400/20 text-yellow-300 shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeOverlay === ModuleType.Leisure && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-cyber-border">
                            {LEISURE_DATA.map(({ category }) => (
                                <button key={category} onClick={() => setActiveLeisureCategory(category)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${ activeLeisureCategory === category ? 'bg-sky-400/20 text-sky-300 shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeOverlay === ModuleType.Marketplace && (
                        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-cyber-border overflow-x-auto">
                            {(MODULE_SECTIONS[activeOverlay] as MarketplaceSection[]).map((item) => (
                            <button key={item} onClick={() => setActiveSection(item)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${ activeSection === item ? 'bg-cyber-purple/20 text-cyber-purple shadow-glow-purple' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                {item}
                            </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onReduce} className="p-2 rounded-full hover:bg-white/20 transition-colors text-gray-400 hover:text-white" title="Reduce">
                        <MinimizeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/50 transition-colors text-gray-400 hover:text-white" title="Close">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            <main className={`flex-1 flex overflow-hidden bg-black/10 min-w-0`}>
                <div className={`flex-1 overflow-y-auto ${isFullBleed ? 'p-0' : 'p-4 sm:p-6'}`}>
                    {renderContent()}
                </div>
            </main>
        </GlassCard>
        <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default FullScreenOverlay;