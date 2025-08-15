
import React, { useState } from 'react';
import { SystemSettingsThemeL3Section } from '../types';
import ThemeL3Sidebar from '../components/ThemeL3Sidebar';
import GlassCard from '../../../components/GlassCard';
import { ToggleSwitch } from './components/FormControls';

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-cyber-cyan mb-4 border-b border-cyber-border pb-2">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const AppearanceContent: React.FC = () => {
    const themes = ['Cyberpunk', 'Glassmorphism', 'Neomorphism', 'Skeuomorphism', 'Material', 'Minimalist', 'Vintage'];
    const [activeTheme, setActiveTheme] = useState('Cyberpunk');
    return (
        <SettingsSection title="UI Style">
            <p className="text-sm text-gray-400">Select a global theme for the application's user interface.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map(theme => (
                    <button key={theme} onClick={() => setActiveTheme(theme)} className={`p-4 rounded-lg border-2 transition-colors ${activeTheme === theme ? 'border-cyber-cyan bg-cyber-cyan/20' : 'border-cyber-border bg-cyber-surface hover:border-cyber-cyan/50'}`}>
                        <span className={`font-semibold ${activeTheme === theme ? 'text-cyber-cyan' : 'text-white'}`}>{theme}</span>
                    </button>
                ))}
            </div>
        </SettingsSection>
    )
};

const LayoutContent: React.FC = () => (
    <SettingsSection title="Layout Properties">
        <p className="text-sm text-gray-400">Adjust core layout properties. Changes will apply globally.</p>
         <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div>
                <label className="text-white font-medium">Global Corner Radius</label>
                <p className="text-xs text-gray-400 mt-1">Adjust the roundness of UI elements.</p>
            </div>
            <input type="range" min="0" max="24" defaultValue="8" className="w-full" />
        </div>
    </SettingsSection>
);

const EffectsContent: React.FC = () => (
    <SettingsSection title="Visual Effects">
        <p className="text-sm text-gray-400">Enable or disable visual effects to customize performance and appearance.</p>
        <ToggleSwitch label="Neon Glow Effects" enabled={true} description="Enable glowing shadows on active elements."/>
        <ToggleSwitch label="Backdrop Blur (Glassmorphism)" enabled={true} description="Enable frosted glass effect on cards."/>
        <ToggleSwitch label="Animations on Load" enabled={true} description="Enable fade-in animations for content."/>
    </SettingsSection>
);

const AccessibilityContent: React.FC = () => (
     <SettingsSection title="Accessibility">
        <p className="text-sm text-gray-400">Improve usability for all users.</p>
        <ToggleSwitch label="High Contrast Mode" enabled={false} description="Increase text and UI element contrast."/>
        <ToggleSwitch label="Reduce Motion" enabled={false} description="Disable non-essential animations."/>
         <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div>
                <label className="text-white font-medium">Font Size</label>
                 <p className="text-xs text-gray-400 mt-1">Adjust the base font size of the application.</p>
            </div>
            <input type="range" min="80" max="120" defaultValue="100" className="w-full" />
        </div>
    </SettingsSection>
);


const Theme: React.FC = () => {
    const [activeL3Section, setActiveL3Section] = useState<SystemSettingsThemeL3Section>('Appearance');

    const renderContent = () => {
        switch (activeL3Section) {
            case 'Appearance': return <AppearanceContent />;
            case 'Layout': return <LayoutContent />;
            case 'Effects': return <EffectsContent />;
            case 'Accessibility': return <AccessibilityContent />;
            default: return <AppearanceContent />;
        }
    };

    return (
        <div className="flex h-full">
            <ThemeL3Sidebar 
                activeSection={activeL3Section} 
                setActiveSection={setActiveL3Section} 
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto">
                <div className="h-full flex flex-col gap-2">
                    <GlassCard className="p-6 flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto space-y-8">
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
export default Theme;
