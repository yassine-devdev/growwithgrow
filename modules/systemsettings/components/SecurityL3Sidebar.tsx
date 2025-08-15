
import React from 'react';
import { SystemSettingsSecurityL3Section } from '../types';
import { SYSTEM_SETTINGS_SECURITY_CORE_L3, SYSTEM_SETTINGS_SECURITY_INNOVATION_L3 } from '../../../constants';
import * as Icons from './Icons';

interface SecurityL3SidebarProps {
    activeSection: SystemSettingsSecurityL3Section;
    setActiveSection: (section: SystemSettingsSecurityL3Section) => void;
}

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1 my-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-6 w-6 text-white mb-1" />
        <span className="text-white text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
);

const iconMap: Record<string, React.FC<{className?: string}>> = {
    'Access Policies': Icons.AccessPoliciesIcon,
    'MFA': Icons.TwoFactorAuthIcon,
    'Audit Logs': Icons.AuditLogIcon,
    'Threat Console (Live)': Icons.ThreatConsoleIcon,
    'Behavioral Anomaly Detection (AI)': Icons.BehavioralAnomalyIcon,
    'Security Playbooks': Icons.SecurityPlaybooksIcon,
};

const SecurityL3Sidebar: React.FC<SecurityL3SidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start py-4 px-2 h-full">
            <div className="bg-[#475569] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {SYSTEM_SETTINGS_SECURITY_CORE_L3.map(section => (
                        <NavItem 
                            key={section}
                            icon={iconMap[section]}
                            label={section}
                            active={activeSection === section}
                            onClick={() => setActiveSection(section)}
                        />
                    ))}
                    <div className="my-2">
                        <h3 className="text-[10px] font-bold text-gray-200/50 uppercase tracking-wider text-center">Innovation</h3>
                    </div>
                    {SYSTEM_SETTINGS_SECURITY_INNOVATION_L3.map(section => (
                        <NavItem 
                            key={section}
                            icon={iconMap[section]}
                            label={section}
                            active={activeSection === section}
                            onClick={() => setActiveSection(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SecurityL3Sidebar;
