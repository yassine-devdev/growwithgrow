
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import SystemSettingsL3Sidebar from '../components/SystemSettingsL3Sidebar';
import { SystemSettingsGeneralSection } from '../types';

const SettingsInput: React.FC<{ label: string, type?: string, value: string, onChange?: (val: string) => void, description?: string }> = ({ label, type = "text", value, onChange, description}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        <div className="md:col-span-1 md:text-right">
            <label className="text-white font-medium">{label}</label>
             {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <input 
            type={type}
            {...(onChange ? { value } : { defaultValue: value })}
            onChange={(e) => onChange?.(e.target.value)}
            className="md:col-span-2 bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
        />
    </div>
);


const SettingsSelect: React.FC<{ label: string, children: React.ReactNode, description?: string }> = ({ label, children, description }) => (
     <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
         <div className="md:col-span-1 md:text-right">
            <label className="text-white font-medium">{label}</label>
             {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
         <select className="md:col-span-2 bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
            {children}
        </select>
    </div>
);

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-cyber-cyan mb-4 border-b border-cyber-border pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


const ProfileContent: React.FC = () => (
    <SettingsSection title="User Profile">
        <SettingsInput label="Full Name" value="Admin User" description="Your name as it appears in the system."/>
        <SettingsInput label="Email Address" type="email" value="admin@system.local" description="This email is used for login and notifications."/>
    </SettingsSection>
);

const AppearanceContent: React.FC = () => (
    <SettingsSection title="Appearance">
        <SettingsSelect label="Theme" description="Change the visual theme of the UI.">
            <option>Cyberpunk Dark</option>
            <option>Solarized Light</option>
            <option>Monokai Pro</option>
        </SettingsSelect>
         <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <div className="md:col-span-1 md:text-right">
                <label className="text-white font-medium">UI Scale</label>
                <p className="text-xs text-gray-400 mt-1">Adjust the size of UI elements.</p>
            </div>
            <input type="range" min="80" max="120" defaultValue="100" className="w-full md:col-span-2" />
        </div>
    </SettingsSection>
);

const LocalizationContent: React.FC = () => (
    <SettingsSection title="Localization">
        <SettingsSelect label="Language" description="Set your preferred language.">
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>日本語</option>
            <option>Español</option>
        </SettingsSelect>
            <SettingsSelect label="Timezone" description="Affects how dates and times are displayed.">
            <option>(GMT-08:00) Pacific Time</option>
            <option>(GMT-05:00) Eastern Time</option>
            <option>(GMT+00:00) Greenwich Mean Time</option>
            <option>(GMT+09:00) Japan Standard Time</option>
        </SettingsSelect>
    </SettingsSection>
);

const RadioButton: React.FC<{ label: string, name: string, value: string, checked: boolean, onChange: (val: string) => void }> = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center gap-3 p-3 bg-cyber-surface border border-cyber-border rounded-md cursor-pointer hover:bg-cyber-surface/50 transition-colors">
        <input 
            type="radio" 
            name={name} 
            value={value} 
            checked={checked} 
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-cyber-cyan bg-gray-700 border-gray-600 focus:ring-cyber-cyan ring-offset-cyber-surface focus:ring-2"
        />
        <span className="text-white font-medium">{label}</span>
    </label>
);

const AIContent: React.FC = () => {
    const [provider, setProvider] = useState<'ollama' | 'openrouter' | 'openai'>('openrouter');
    const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
    const [openRouterKey, setOpenRouterKey] = useState('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');
    const [openRouterModel, setOpenRouterModel] = useState('gpt-oss-20b');
    const [openAIKey, setOpenAIKey] = useState('');

    return (
        <SettingsSection title="AI Provider Configuration">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Select and configure the AI provider for the entire system. Your `API_KEY` environment variable will be used for Gemini, but you can configure other services below.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                <div className="md:col-span-1 md:text-right">
                    <label className="text-white font-medium">AI Provider</label>
                    <p className="text-xs text-gray-400 mt-1">Choose the backend for AI features.</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <RadioButton 
                        label="Ollama (Local)" 
                        name="ai-provider" 
                        value="ollama" 
                        checked={provider === 'ollama'} 
                        onChange={(val) => setProvider(val as any)}
                    />
                    <RadioButton 
                        label="OpenRouter" 
                        name="ai-provider" 
                        value="openrouter" 
                        checked={provider === 'openrouter'} 
                        onChange={(val) => setProvider(val as any)}
                    />
                     <RadioButton 
                        label="OpenAI" 
                        name="ai-provider" 
                        value="openai" 
                        checked={provider === 'openai'} 
                        onChange={(val) => setProvider(val as any)}
                    />
                </div>
            </div>

            {provider === 'ollama' && (
                 <div className="pt-4 mt-4 border-t border-cyber-border/50">
                    <SettingsInput 
                        label="Ollama Host URL" 
                        value={ollamaHost} 
                        onChange={setOllamaHost}
                        description="The local URL for your Ollama instance."
                    />
                </div>
            )}
            
            {provider === 'openrouter' && (
                <div className="pt-4 mt-4 border-t border-cyber-border/50 space-y-4">
                    <SettingsInput 
                        label="OpenRouter API Key"
                        type="text"
                        value={openRouterKey}
                        onChange={setOpenRouterKey}
                        description="Your API key from OpenRouter."
                    />
                    <SettingsInput 
                        label="OpenRouter Model"
                        value={openRouterModel}
                        onChange={setOpenRouterModel}
                        description="e.g., gpt-oss-20b (free)"
                    />
                </div>
            )}

            {provider === 'openai' && (
                <div className="pt-4 mt-4 border-t border-cyber-border/50">
                     <SettingsInput 
                        label="OpenAI API Key"
                        type="password"
                        value={openAIKey}
                        onChange={setOpenAIKey}
                        description="Your API key from OpenAI."
                    />
                </div>
            )}
        </SettingsSection>
    );
};


const General: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsGeneralSection>('Profile');
    
    const renderContent = () => {
        switch(activeL3Section) {
            case 'Profile': return <ProfileContent />;
            case 'Appearance': return <AppearanceContent />;
            case 'Localization': return <LocalizationContent />;
            case 'AI': return <AIContent />;
            default: return <ProfileContent />;
        }
    };

    return (
       <div className="flex h-full -m-1 sm:-m-2 lg:-m-3">
            <SystemSettingsL3Sidebar 
                activeL2Section="General" 
                activeL3Section={activeL3Section} 
                setActiveL3Section={setActiveL3Section as (section: any) => void} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                 <div className="h-full flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-white">General Settings</h2>
                    <GlassCard className="p-6 flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-8">
                            {renderContent()}
                            <div className="pt-6 border-t border-cyber-border flex justify-end gap-4">
                                <button className="px-6 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Revert</button>
                                <button className="px-6 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan transition-shadow">Save Changes</button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};

export default General;
