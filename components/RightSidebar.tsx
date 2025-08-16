

import React from 'react';
import { ModuleType, ModuleInfo } from '../types';
import { MAIN_MODULES } from '../constants';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const NavButton: React.FC<{
  module: ModuleInfo;
  isActive: boolean;
  onClick: () => void;
}> = ({ module, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={module.title}
      aria-label={`Navigate to ${module.title} module`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "relative flex items-center justify-center rounded-xl transition-all duration-500 ease-out group focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg overflow-hidden",
        "w-full h-[80px] flex-col gap-2 p-1",
        isActive
          ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      )}
    >
      {/* Clean active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyber-cyan rounded-r-full" />
      )}
      
      {/* Simple hover effect */}
      <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
      } bg-cyber-cyan/10`} />
      
      {/* Clean icon styling */}
      <div className={`relative z-10 transition-all duration-200 ${
        isActive ? 'scale-105' : 'group-hover:scale-105'
      }`}>
        <module.icon className={cn(
          "flex-shrink-0 transition-all duration-200",
          "w-7 h-7 mb-1",
          isActive ? 'text-cyber-cyan' : 'text-gray-400 group-hover:text-cyber-cyan'
        )} />
      </div>
      
      {/* Text styling */}
      <span className={`relative z-10 text-[11px] font-medium text-center leading-tight transition-all duration-200 ${
        isActive ? 'text-cyber-cyan' : 'text-gray-400 group-hover:text-white'
      }`}>
        {module.title}
      </span>
      
      {/* Simple active state indicator */}
      {isActive && (
        <div className="absolute inset-0 rounded-lg bg-cyber-cyan/5" />
      )}
    </button>
  );
};

const RightSidebar: React.FC<RightSidebarProps> = ({ activeModule, setActiveModule }) => {
  return (
    <aside className="w-[90px] p-2 flex-shrink-0" role="navigation" aria-label="Main module navigation">
      <GlassCard className="relative w-full h-full flex flex-col items-center justify-around py-4 overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/20 to-gray-900/20" />
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-around py-4">
          {MAIN_MODULES.map((module, index) => (
            <div
              key={module.id}
              className="w-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <NavButton
                module={module}
                isActive={activeModule === module.id}
                onClick={() => setActiveModule(module.id)}
              />
            </div>
          ))}
        </div>
      </GlassCard>
    </aside>
  );
};

export default RightSidebar;
