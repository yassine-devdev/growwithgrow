
import React, { useState } from 'react';
import ToolsL3Sidebar from '../components/ToolsL3Sidebar';
import { ToolsSettingSection } from '../types';
import GlassCard from '../../../components/GlassCard';

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-cyber-cyan mb-4 border-b border-cyber-border pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const ApiKeysContent: React.FC = () => (
    <SettingsSection title="API Keys">
        <p className="text-sm text-gray-400">Manage API keys for integrated services.</p>
        <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-white">Google Gemini API</p>
                <p className="font-mono text-xs text-gray-500">Key set via environment variable</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/30 text-green-300">Active</span>
        </div>
         <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-white">OpenRouter API</p>
                <p className="font-mono text-xs text-gray-400">sk-or-v1-••••••••••••••••••••••••••••39b6b</p>
            </div>
             <button className="text-sm font-medium text-cyber-cyan hover:underline">Revoke</button>
        </div>
    </SettingsSection>
);

const UsageLimitsContent: React.FC = () => (
    <SettingsSection title="Usage Limits">
        <p className="text-sm text-gray-400">Monitor your monthly usage of AI tools.</p>
        <div>
            <label className="text-white font-medium">Text Generation</label>
            <p className="text-xs text-gray-500">1,250 / 10,000 requests</p>
            <div className="w-full bg-black/30 rounded-full h-2.5 mt-1"><div className="bg-cyber-purple h-2.5 rounded-full" style={{width: '12.5%'}}></div></div>
        </div>
         <div>
            <label className="text-white font-medium">Image Generation</label>
            <p className="text-xs text-gray-500">85 / 100 images</p>
            <div className="w-full bg-black/30 rounded-full h-2.5 mt-1"><div className="bg-cyber-orange h-2.5 rounded-full" style={{width: '85%'}}></div></div>
        </div>
    </SettingsSection>
);

const DefaultsContent: React.FC = () => (
     <SettingsSection title="Default Settings">
        <div className="flex items-center justify-between">
            <p className="text-white font-medium">Default Chart Type</p>
            <select className="bg-cyber-surface border border-cyber-border rounded-md px-3 py-1 text-white text-sm">
                <option>Bar Chart</option>
                <option>Line Chart</option>
                <option>Pie Chart</option>
            </select>
        </div>
     </SettingsSection>
);


const Setting: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<ToolsSettingSection>('API Keys');

    const renderContent = () => {
        switch(activeL3Section) {
            case 'API Keys': return <ApiKeysContent />;
            case 'Usage Limits': return <UsageLimitsContent />;
            case 'Defaults': return <DefaultsContent />;
            default: return <ApiKeysContent />;
        }
    };

    return (
        <div className="flex h-full">
            <ToolsL3Sidebar 
                activeL2Section="Setting" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                <GlassCard className="p-6 h-full">
                    <div className="max-w-2xl mx-auto">
                        {renderContent()}
                    </div>
                </GlassCard>
            </main>
        </div>
    );
};
export default Setting;
