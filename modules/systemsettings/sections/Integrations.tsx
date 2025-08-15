

import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import SystemSettingsL3Sidebar from '../components/SystemSettingsL3Sidebar';
import { SystemSettingsIntegrationsSection } from '../types';

// Dummy icons
const SlackIcon: React.FC = () => <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold text-lg">S</div>;
const GitHubIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-10 h-10 p-2 rounded-lg bg-black text-white">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
);
const FigmaIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 p-2 rounded-lg bg-black text-white">
        <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM8 12c0-2.21.896-4 2-4h2v8h-2c-1.104 0-2-1.79-2-4zm2-2h2V6h-2c-1.104 0-2 .896-2 2s.896 2 2 2zm2 8h-2c-1.104 0-2-.896-2-2s.896-2 2-2h2v4zm4-2c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" />
    </svg>
);
const NotionIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 p-2 rounded-lg bg-white text-black">
        <path d="M12.5 2.016L4 2.015v18.01h2V9.018l6.5 11.007h2L7.994 9.018H14V2.016h-1.5zM18 2.015v18.01h2V2.015h-2z" />
    </svg>
);


const integrations = [
    { name: "Slack", icon: SlackIcon, description: "Send notifications and alerts to your Slack channels.", connected: true },
    { name: "GitHub", icon: GitHubIcon, description: "Sync repositories and track issues directly.", connected: false },
    { name: "Figma", icon: FigmaIcon, description: "Embed and preview Figma designs.", connected: false },
    { name: "Notion", icon: NotionIcon, description: "Link and sync with your Notion workspaces.", connected: true },
];

const PlaceholderContent: React.FC<{ section: string }> = ({ section }) => (
    <GlassCard className="h-full flex items-center justify-center">
        <p className="text-gray-400 font-mono text-lg">{section} Content</p>
    </GlassCard>
);

const IntegrationsContent: React.FC = () => (
    <div className="h-full flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Integrations</h2>
        <p className="text-gray-400 -mt-4">Connect third-party applications to enhance your workflow.</p>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {integrations.map(integration => (
                <GlassCard key={integration.name} className="p-4 flex items-center justify-between transition-all hover:border-cyber-cyan/50">
                    <div className="flex items-center gap-4">
                        <integration.icon />
                        <div>
                            <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                            <p className="text-sm text-gray-400">{integration.description}</p>
                        </div>
                    </div>
                    {integration.connected ? (
                         <button className="px-5 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors">
                            Disconnect
                        </button>
                    ) : (
                         <button className="px-5 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan transition-shadow">
                            Connect
                        </button>
                    )}
                </GlassCard>
            ))}
        </div>
    </div>
);

const Integrations: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsIntegrationsSection>('Connected Apps');

    const renderContent = () => {
        switch(activeL3Section) {
            case 'Connected Apps':
                return <IntegrationsContent />;
            default:
                return <PlaceholderContent section={activeL3Section} />;
        }
    }
    return (
        <div className="flex h-full">
            <SystemSettingsL3Sidebar 
                activeL2Section="Integrations" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default Integrations;
