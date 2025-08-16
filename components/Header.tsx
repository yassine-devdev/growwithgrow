

import React from 'react';
import { BellIcon, SearchIcon } from './icons/InterfaceIcons';
import { ModuleType, ModuleSection } from '../types';
import { MODULE_SECTIONS } from '../constants';
import { cn } from '@/lib/utils';

interface HeaderProps {
  moduleTitle: string;
  activeModule: ModuleType;
  activeModuleSection: ModuleSection;
  setActiveModuleSection: (section: ModuleSection) => void;
}

const ExpandingSearchBar: React.FC = () => {
    return (
      <div className="relative group">
        <input 
          type="text" 
          name="text" 
          className="peer h-8 w-8 cursor-pointer rounded-full bg-gray-800/50 pl-8 pr-3 text-sm text-white outline-none
                     placeholder:text-gray-400 placeholder:font-medium
                     border border-gray-600/40 backdrop-blur-sm
                     shadow-sm hover:shadow-md hover:border-gray-500/60
                     transition-all duration-300 ease-out
                     focus:w-40 focus:cursor-text valid:w-40 valid:cursor-text
                     focus:border-cyber-cyan/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]
                     valid:border-cyber-cyan/50 valid:shadow-[0_0_10px_rgba(0,255,255,0.2)]
                     md:focus:w-48 md:valid:w-48
                     font-sans" 
          required 
          placeholder="Search..." 
        />
        
        <div className="absolute top-0 left-0 h-8 w-8 p-2 pointer-events-none
                        peer-focus:pointer-events-auto peer-valid:pointer-events-auto
                        transition-all duration-300">
          <SearchIcon className="h-full w-full text-gray-400 peer-focus:text-cyber-cyan peer-valid:text-cyber-cyan transition-colors duration-300" />
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
    <header className="h-[70px] md:h-[65px] p-2 flex-shrink-0">
      <div className="relative w-full h-full flex items-center px-4 md:px-6 gap-4 md:gap-6 overflow-hidden bg-gradient-to-tr from-card-from to-card-to border border-cyber-border rounded-xl shadow-lg backdrop-blur-sm">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/30 to-gray-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.08),transparent_50%)]" />
        
        <div className="relative z-10 w-full h-full flex items-center gap-4 md:gap-6">
          {/* Left Section: Logo & Title */}
          <div className="flex items-center gap-3 md:gap-4">
          
          {/* Enhanced Logo */}
          <div className="relative group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-lg shadow-md relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
              {/* Core dot */}
              <div className="absolute inset-1 bg-white rounded-sm" />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide uppercase whitespace-nowrap truncate drop-shadow-sm">
            {moduleTitle}
          </h1>
        </div>

        {/* Center Section: Enhanced Module Navigation */}
        {showHeaderNav && sections.length > 0 && (
          <nav 
            className="hidden md:flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-600/40 backdrop-blur-sm overflow-x-auto shadow-md"
            role="tablist"
            aria-label="Module sections navigation"
          >
            <div className="flex items-center gap-1">
              {sections.map((item, index) => (
                <button
                  key={item}
                  onClick={() => setActiveModuleSection(item)}
                  className={cn(
                    "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg hover:scale-105",
                    activeModuleSection === item
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_8px_rgba(0,255,255,0.15)]'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white hover:shadow-sm'
                  )}
                  role="tab"
                  aria-selected={activeModuleSection === item}
                  aria-label={`Navigate to ${item} section`}
                  tabIndex={activeModuleSection === item ? 0 : -1}
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>
        )}
        
        {/* Right Section: Enhanced Search, Notifications, Avatar */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          {/* Enhanced Search Bar */}
          <div className="block">
            <ExpandingSearchBar />
          </div>
          
          {/* Enhanced Notification Button */}
          <button 
            className="relative text-gray-300 hover:text-cyber-cyan transition-all duration-300 p-2 rounded-md hover:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg group"
            aria-label="Notifications"
            aria-describedby="notification-count"
          >
            <div className="relative">
              <BellIcon className="h-5 w-5 md:h-6 md:w-6 transition-all duration-300 group-hover:scale-110" />
              {/* Enhanced notification indicator */}
              <span 
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                id="notification-count"
                aria-label="3 new notifications"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-sm"></span>
              </span>
            </div>
          </button>
          
          {/* Enhanced Avatar */}
          <button 
            className="relative focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg group"
            aria-label="User profile menu"
            aria-expanded="false"
          >
            <div className="relative">
              <img
                src="https://picsum.photos/id/1005/100/100"
                alt="User profile picture"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-600 transition-all duration-300 hover:border-cyber-cyan group-hover:scale-105 shadow-md"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
            </div>
          </button>
        </div>
        </div>
      </div>


    </header>
  );
};

export default Header;
