import React from 'react';
import { ModuleSection } from '../../../types';
import { ToolsMarketingL3Section } from '../types';
import { TOOLS_MARKETING_L4_MAP } from '../../../constants';
import * as Icons from './MarketingIcons';

interface MarketingL4SidebarProps {
    activeL3: ToolsMarketingL3Section;
    activeL4: ModuleSection;
    setActiveL4: (section: ModuleSection) => void;
}

const NavItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-full h-[60px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 p-1
        ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
        <Icon className="h-5 w-5 text-white" />
        <span className="text-white text-[10px] font-medium leading-tight text-center mt-1">{label}</span>
    </button>
);

const iconMap: Record<string, React.FC<{className?: string}>> = {
    // SEO
    "SEO": Icons.SEOIcon, "Research": Icons.ResearchIcon, "Generator": Icons.GeneratorIcon,
    "Competitor": Icons.CompetitorIcon, "Backlink": Icons.BacklinkIcon, "Local": Icons.LocalIcon,
    // Ads
    "Multi-Platform": Icons.MultiPlatformIcon, "Ad Copy": Icons.AdCopyIcon, "Creative": Icons.CreativeIcon,
    "Budget": Icons.BudgetIcon, "A/B Testing": Icons.ABTestingIcon, "Retargeting": Icons.RetargetingIcon,
    "ROI": Icons.ROIIcon, "Audience": Icons.AudienceIcon,
    // Social
    "Calendar": Icons.CalendarIcon, "AI Post": Icons.AIPostIcon, "Trends": Icons.TrendsIcon,
    "Inbox": Icons.InboxIcon, "Shorts": Icons.ShortsIcon, "Listening": Icons.ListeningIcon,
    // Content
    "Blog Ideas": Icons.BlogIdeasIcon, "AI Writer": Icons.AIWriterIcon, "Performance": Icons.PerformanceIcon,
    "Repurpose": Icons.RepurposeIcon, "Email Automation": Icons.EmailAutomationIcon, "Newsletter": Icons.NewsletterIcon,
    // Analytics
    "Dashboard": Icons.DashboardIcon, "Funnel": Icons.FunnelIcon, "Heatmaps": Icons.HeatmapsIcon,
    "KPIs": Icons.KPIsIcon, "Alerts": Icons.AlertsIcon,
    // Automation
    "Scheduler": Icons.SchedulerIcon, "Tags": Icons.TagsIcon, "Planner": Icons.PlannerIcon,
    "Chatbot": Icons.ChatbotIcon, "CRM": Icons.CRMIcon,
    // Bonus
    "Influencer": Icons.InfluencerIcon, "Voice SEO": Icons.VoiceSEOIcon, "Branding": Icons.BrandingIcon,
    "Predictor": Icons.PredictorIcon, "Reputation": Icons.ReputationIcon, "Competitor Ads": Icons.CompetitorAdsIcon,
    "Market Radar": Icons.MarketRadarIcon,
};


const MarketingL4Sidebar: React.FC<MarketingL4SidebarProps> = ({ activeL3, activeL4, setActiveL4 }) => {
    const navItems = TOOLS_MARKETING_L4_MAP[activeL3] || [];
    
    return (
        <aside className="w-20 flex-shrink-0 flex flex-col items-center justify-start h-full">
            <div className="bg-[#581c87] rounded-2xl p-2 shadow-lg w-full h-full flex flex-col overflow-hidden">
                <nav className="w-full overflow-y-auto pr-1">
                    {navItems.map(section => (
                         <NavItem 
                            key={section}
                            icon={iconMap[section || ''] || Icons.DefaultIcon}
                            label={section || ''}
                            active={activeL4 === section}
                            onClick={() => setActiveL4(section)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
};
export default MarketingL4Sidebar;
