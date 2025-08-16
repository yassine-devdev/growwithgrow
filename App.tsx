

import React, { useState } from 'react';
import { ModuleType, ModuleSection } from './types';
import { DashboardSection } from './modules/dashboard/types';
import { ToolsSection } from './modules/tools/types';
import { SchoolHubSection } from './modules/schoolhub/types';
import { CommunicationsSection } from './modules/communications/types';
import { KnowledgeBaseSection } from './modules/knowledgebase/types';
import { ConciergeAISection } from './modules/conciergeai/types';
import { CRMSection } from './modules/crm/types';
import { SystemSettingsSection } from './modules/systemsettings/types';
import { MODULES, MODULE_SECTIONS } from './constants';
import { TRPCProvider } from './services/trpc/Provider';
import ErrorBoundary from './components/ErrorBoundary';
import './services/configValidator'; // Auto-validate configuration
import './services/productionCheck'; // Check production readiness

import Header from './components/Header';
import RightSidebar from './components/RightSidebar';
import BottomDock from './components/BottomDock';

import Dashboard from './modules/dashboard/index';
import Tools from './modules/tools/index';
import SchoolHub from './modules/schoolhub/index';
import Communications from './modules/communications/index';
import KnowledgeBase from './modules/knowledgebase/index';
import ConciergeAI from './modules/conciergeai/index';
import CRM from './modules/crm/index';
import SystemSettings from './modules/systemsettings/index';
import FullScreenOverlay from './components/FullScreenOverlay';

const MatrixBackground: React.FC = () => {
  return (
    <div className="matrix-container">
      <div className="matrix-grid" />
    </div>
  );
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.Dashboard);
  const [activeModuleSection, setActiveModuleSection] = useState<ModuleSection | null>(MODULE_SECTIONS[ModuleType.Dashboard]?.[0] ?? null);

  // State for personal module overlay
  const [activeOverlay, setActiveOverlay] = useState<ModuleType | null>(null);
  const [isPersonalModulesBarVisible, setIsPersonalModulesBarVisible] = useState<boolean>(false);

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          // Close overlays or mobile menus
          if (activeOverlay) {
            closeOverlay();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          // Quick module navigation (1-8 keys)
          const moduleIndex = parseInt(event.key) - 1;
          const modules = Object.values(ModuleType);
          if (modules[moduleIndex]) {
            handleSetActiveModule(modules[moduleIndex]);
          }
          break;
        case 'h':
        case 'H':
          // Go to Dashboard (Home)
          handleSetActiveModule(ModuleType.Dashboard);
          break;
        case 't':
        case 'T':
          // Go to Tools
          handleSetActiveModule(ModuleType.Tools);
          break;
        case 's':
        case 'S':
          // Go to School Hub
          handleSetActiveModule(ModuleType.SchoolHub);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeOverlay]);

  const activeModuleData = MODULES.find(m => m.id === activeModule) || MODULES[0];

  const handleSetActiveModule = (module: ModuleType) => {
    setActiveModule(module);
    const sections = MODULE_SECTIONS[module];
    if (sections && sections.length > 0) {
      setActiveModuleSection(sections[0]);
    } else {
      setActiveModuleSection(null);
    }
  };

  // --- Personal App Overlay Handlers ---
  const launchOverlay = (module: ModuleType) => {
    setActiveOverlay(module);
    setIsPersonalModulesBarVisible(false); // Hide the bar after launching an app
  };

  const reduceOverlay = () => {
      setActiveOverlay(null);
      setIsPersonalModulesBarVisible(true); // Re-open the launcher bar
  };

  const closeOverlay = () => {
      setActiveOverlay(null);
  };

  const togglePersonalModulesBar = () => {
      setIsPersonalModulesBarVisible(prev => !prev);
  };

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.Dashboard:
        return <Dashboard activeSection={activeModuleSection as DashboardSection} />;
      case ModuleType.Tools:
        return <Tools activeSection={activeModuleSection as ToolsSection} />;
      case ModuleType.SchoolHub:
        return <SchoolHub activeSection={activeModuleSection as SchoolHubSection} />;
      case ModuleType.Communications:
        return <Communications activeSection={activeModuleSection as CommunicationsSection} />;
      case ModuleType.KnowledgeBase:
        return <KnowledgeBase activeSection={activeModuleSection as KnowledgeBaseSection} />;
      case ModuleType.ConciergeAI:
        return <ConciergeAI activeSection={activeModuleSection as ConciergeAISection} />;
      case ModuleType.CRM:
        return <CRM activeSection={activeModuleSection as CRMSection} />;
      case ModuleType.SystemSettings:
        return <SystemSettings activeSection={activeModuleSection as SystemSettingsSection}/>;
      // Personal modules are now overlays, so they don't render in the main view.
      case ModuleType.Marketplace:
      case ModuleType.LeisureLifestyle:
      case ModuleType.Hobbies:
      case ModuleType.Leisure:
      case ModuleType.Gamification:
      case ModuleType.Media:
      case ModuleType.Studio:
        return null;
      default:
        return <Dashboard activeSection={MODULE_SECTIONS[ModuleType.Dashboard]?.[0] as DashboardSection} />;
    }
  };

  return (
    <ErrorBoundary>
      <TRPCProvider>
        <div className="h-screen w-screen flex flex-col font-sans">
        <MatrixBackground />
        <div className="relative flex flex-col flex-1 overflow-hidden">
          <Header 
            moduleTitle={activeModuleData.title} 
            activeModule={activeModule}
            activeModuleSection={activeModuleSection}
            setActiveModuleSection={setActiveModuleSection}
          />
          <div className="flex flex-1 overflow-hidden">
            <main className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto p-1 sm:p-2 lg:p-3 min-h-0`}>
              {renderModule()}
            </main>
            <RightSidebar activeModule={activeModule} setActiveModule={handleSetActiveModule} />
          </div>
          
          <FullScreenOverlay
              activeOverlay={activeOverlay}
              onClose={closeOverlay}
              onReduce={reduceOverlay}
          />
          
          <BottomDock 
            launchOverlay={launchOverlay}
            isPersonalModulesBarVisible={isPersonalModulesBarVisible}
            togglePersonalModulesBar={togglePersonalModulesBar}
          />
        </div>
      </div>
      </TRPCProvider>
    </ErrorBoundary>
  );
};

export default App;