

import React from 'react';
import { ModuleType, ModuleInfo } from '../types';
import { MAIN_MODULES } from '../constants';
import GlassCard from './GlassCard';

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
      className={`relative w-full h-[60px] flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-0.5
        ${isActive
          ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-glow-cyan'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <module.icon className="w-5 h-5 mb-0.5 flex-shrink-0" />
      <span className="text-[9px] font-medium text-center leading-tight">{module.title}</span>
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyber-cyan rounded-r-full transition-transform duration-300 ease-in-out
          ${isActive ? 'scale-y-100' : 'scale-y-0'} group-hover:scale-y-50`}
      ></div>
    </button>
  );
};

const RightSidebar: React.FC<RightSidebarProps> = ({ activeModule, setActiveModule }) => {
  return (
    <aside className="w-[64px] p-1.5 flex-shrink-0">
      <GlassCard className="w-full h-full flex flex-col items-center justify-around py-1.5">
        {MAIN_MODULES.map((module) => (
          <NavButton
            key={module.id}
            module={module}
            isActive={activeModule === module.id}
            onClick={() => setActiveModule(module.id)}
          />
        ))}
      </GlassCard>
    </aside>
  );
};

export default RightSidebar;
