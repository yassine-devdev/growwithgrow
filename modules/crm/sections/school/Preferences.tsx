

import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, description: string }> = ({ label, enabled, description }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <span className="text-white font-medium">{label}</span>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors ${enabled ? 'bg-cyber-cyan' : 'bg-gray-600'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-cyber-cyan mb-4 border-b border-cyber-border pb-2">{title}</h3>
        <div className="space-y-2 divide-y divide-cyber-border/50">{children}</div>
    </div>
);

const Preferences: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">School Preferences</h2>
            <p className="text-gray-400 -mt-4">Customize settings for school management.</p>
            <GlassCard className="p-6 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-8">
                    <SettingsSection title="Notification Settings">
                        <ToggleSwitch label="New School Onboarding" enabled={true} description="Notify when a new school completes onboarding." />
                        <ToggleSwitch label="Subscription Changes" enabled={true} description="Notify on plan upgrades, downgrades, or cancellations." />
                        <ToggleSwitch label="Billing Failure" enabled={true} description="Send alerts for failed payment transactions." />
                    </SettingsSection>
                    
                    <SettingsSection title="General Settings">
                         <div className="flex items-center justify-between py-2">
                            <div>
                                <span className="text-white font-medium">Academic Year Start</span>
                                <p className="text-sm text-gray-400">Set the default start month for new schools.</p>
                            </div>
                            <select className="bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
                                <option>August</option>
                                <option>September</option>
                                <option>January</option>
                            </select>
                        </div>
                    </SettingsSection>

                    <div className="pt-6 border-t border-cyber-border flex justify-end gap-4">
                        <button className="px-6 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">Revert</button>
                        <button className="px-6 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan transition-shadow">Save Changes</button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Preferences;
