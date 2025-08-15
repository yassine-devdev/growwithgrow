

import React from 'react';
import GlassCard from './GlassCard';
import { BellIcon } from './icons/InterfaceIcons';
import { ModuleType, ModuleSection } from '../types';
import { MODULE_SECTIONS } from '../constants';
import { CommunicationsSection } from '../modules/communications/types';

interface HeaderProps {
  moduleTitle: string;
  activeModule: ModuleType;
  activeModuleSection: ModuleSection;
  setActiveModuleSection: (section: ModuleSection) => void;
}

const ExpandingSearchBar: React.FC = () => {
    return (
      <div className="relative">
        <input 
          type="text" 
          name="text" 
          className="peer h-10 w-10 cursor-pointer rounded-full bg-[#191A1E] pl-10 pr-4 text-[15px] text-white outline-none
                     placeholder:text-gray-400
                     shadow-[1.5px_1.5px_3px_#0e0e0e,_-1.5px_-1.5px_3px_rgba(95,94,94,0.25)]
                     transition-all duration-300 ease-in-out
                     focus:w-52 focus:cursor-text valid:w-52 valid:cursor-text
                     focus:shadow-[inset_1.5px_1.5px_3px_#0e0e0e,_inset_-1.5px_-1.5px_3px_#5f5e5e]
                     valid:shadow-[inset_1.5px_1.5px_3px_#0e0e0e,_inset_-1.5px_-1.5px_3px_#5f5e5e]" 
          required 
          placeholder="Type to search..." 
        />
        <div className="icon pointer-events-none absolute top-0 left-0 h-10 w-10 p-2
                        peer-focus:cursor-pointer peer-focus:pointer-events-auto
                        peer-valid:cursor-pointer peer-valid:pointer-events-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="ionicon h-full w-full text-gray-400" viewBox="0 0 512 512">
            <title>Search</title>
            <path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={32} />
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={32} d="M338.29 338.29L448 448" />
          </svg>
        </div>
      </div>
    );
};

const Header: React.FC<HeaderProps> = ({ moduleTitle, activeModule, activeModuleSection, setActiveModuleSection }) => {
  const sections = MODULE_SECTIONS[activeModule] || [];
  const showHeaderNav = [
    ModuleType.SchoolHub, 
    ModuleType.Marketplace,
    ModuleType.SystemSettings,
    ModuleType.Tools,
    ModuleType.ConciergeAI,
    ModuleType.KnowledgeBase,
    ModuleType.CRM,
    ModuleType.Communications,
  ].includes(activeModule);

  return (
    <header className="h-[50px] p-1.5 flex-shrink-0">
      <GlassCard className="w-full h-full flex items-center px-6 gap-6">
        {/* Left Section: Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-cyber-cyan rounded-full shadow-glow-cyan animate-pulse"></div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase whitespace-nowrap">{moduleTitle}</h1>
        </div>

        {/* Center Section: Dynamic Module Navigation */}
        {showHeaderNav && sections.length > 0 && (
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-cyber-border overflow-x-auto">
            {sections.map((item) => (
              <button
                key={item}
                onClick={() => setActiveModuleSection(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                  activeModuleSection === item
                    ? 'bg-cyber-purple/20 text-cyber-purple shadow-glow-purple'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        
        {/* Right Section: Search, Notifications, Avatar */}
        <div className="flex items-center gap-6 ml-auto">
          <ExpandingSearchBar />
          <button className="relative text-gray-300 hover:text-cyber-cyan transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-orange"></span>
            </span>
          </button>
          <img
            src="https://picsum.photos/id/1005/100/100"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-cyber-purple"
          />
        </div>
      </GlassCard>
    </header>
  );
};

export default Header;
