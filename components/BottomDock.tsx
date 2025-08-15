

import React from 'react';
import GlassCard from './GlassCard';
import { ModuleType, ModuleInfo } from '../types';
import { PERSONAL_MODULES } from '../constants';
import { AppLauncherIcon } from './icons/InterfaceIcons';

interface BottomDockProps {
  isPersonalModulesBarVisible: boolean;
  togglePersonalModulesBar: () => void;
  launchOverlay: (module: ModuleType) => void;
}

// Button for the horizontal bar
const LauncherButton: React.FC<{
  moduleInfo: ModuleInfo;
  onClick: () => void;
}> = ({ moduleInfo, onClick }) => (
    <button
      onClick={onClick}
      title={`Launch ${moduleInfo.title}`}
      className="h-10 flex-1 min-w-0 flex flex-col items-center justify-center rounded-lg transition-all duration-200 ease-in-out bg-black/10 text-gray-400 hover:bg-white/10 hover:text-white"
    >
        <moduleInfo.icon className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-bold truncate w-full px-1">{moduleInfo.title}</span>
    </button>
);


const BottomDock: React.FC<BottomDockProps> = ({ isPersonalModulesBarVisible, togglePersonalModulesBar, launchOverlay }) => {
  return (
    <footer className="h-[50px] p-1.5 flex-shrink-0 z-30 relative">
      <GlassCard className="w-full h-full flex items-center justify-between px-4">
        {/* Container for launcher and sliding/scrolling modules */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
                onClick={togglePersonalModulesBar}
                title="Toggle Personal Apps"
                className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out ${
                    isPersonalModulesBarVisible 
                        ? 'bg-cyber-purple/30 text-cyber-purple' 
                        : 'bg-black/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
                <AppLauncherIcon className="w-6 h-6" />
            </button>
            
            {/* Sliding Container */}
            <div className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden flex-1 min-w-0 ${isPersonalModulesBarVisible ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'}`}>
                <div className="h-6 w-px bg-cyber-border/50 mx-1.5 flex-shrink-0"></div>
                {/* Horizontally Scrolling Button List */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {PERSONAL_MODULES.map(module => (
                        <LauncherButton 
                            key={module.id} 
                            moduleInfo={module} 
                            onClick={() => launchOverlay(module.id)} 
                        />
                    ))}
                </div>
            </div>
        </div>

        <div className="flex-shrink-0">
             {/* Area for future right-aligned dock items */}
        </div>
      </GlassCard>
    </footer>
  );
};

export default BottomDock;
