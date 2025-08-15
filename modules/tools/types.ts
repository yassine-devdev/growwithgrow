export type ToolsOverviewSection = "Key Dashboards" | "Custom Reports" | "Data Sources" | "Causal Inference (AI)" | "Scenario Forecast" | "Data Storyteller (AI)";
export type ToolsMarketingL3Section = "SEO Command Center" | "Advertising Hub" | "Social Media Suite" | "Content Marketing Tools" | "Analytics & Reporting" | "Automation & AI Assistance" | "Bonus Power Tools";
export type ToolsFinanceSection = "Expense Tracker" | "Invoice Generator" | "Budget Forecaster";
export type ToolsAISection = "Text Generator" | "Chart Generator" | "Image Generator";
export type ToolsSettingSection = "API Keys" | "Usage Limits" | "Defaults";
export type ToolsSection = 'Overview' | 'Marketing' | 'Finance' | 'AI' | 'Setting';

// L4 Marketing Sections
export type ToolsMarketingL4_SEOSection = "SEO" | "Research" | "Generator" | "Competitor" | "Backlink" | "Local";
export type ToolsMarketingL4_AdsSection = "Multi-Platform" | "Ad Copy" | "Creative" | "Budget" | "A/B Testing" | "Retargeting" | "ROI" | "Audience";
export type ToolsMarketingL4_SocialSection = "Calendar" | "AI Post" | "Trends" | "Competitor" | "Inbox" | "Shorts" | "Listening";
export type ToolsMarketingL4_ContentSection = "Blog Ideas" | "AI Writer" | "Performance" | "Repurpose" | "Email Automation" | "Newsletter";
export type ToolsMarketingL4_AnalyticsSection = "Dashboard" | "Funnel" | "Heatmaps" | "KPIs" | "Alerts";
export type ToolsMarketingL4_AutomationSection = "Scheduler" | "Tags" | "Planner" | "Chatbot" | "CRM";
export type ToolsMarketingL4_BonusSection = "Influencer" | "Voice SEO" | "Branding" | "Predictor" | "Reputation" | "Competitor Ads" | "Market Radar";

export type ToolsMarketingL4Section = 
    | ToolsMarketingL4_SEOSection
    | ToolsMarketingL4_AdsSection
    | ToolsMarketingL4_SocialSection
    | ToolsMarketingL4_ContentSection
    | ToolsMarketingL4_AnalyticsSection
    | ToolsMarketingL4_AutomationSection
    | ToolsMarketingL4_BonusSection;


// Marketing Automation Types
export interface AutomationWorkflow {
  id: string;
  name: string;
  type: 'Facebook Ad' | 'Email Sequence' | 'Google Ads';
  status: 'Active' | 'Paused' | 'Draft';
  performance: {
    reach: number;
    conversions: number;
    cost: number;
  };
}

export interface AudienceSuggestion {
    demographics: string[];
    interests: string[];
    behaviors: string[];
}

export interface CampaignBrief {
    productName: string;
    productDescription: string;
    campaignGoal: string;
    targetAudience: string;
    budget: string;
}

export interface CampaignPlan {
    campaignTitle: string;
    slogan: string;
    targetPersona: {
        name: string;
        demographics: string;
        painPoints: string[];
    };
    coreMessaging: string[];
    strategicAngles: string[];
    channelStrategy: {
        platform: string;
        rationale: string;
        contentIdeas: string[];
    }[];
    sampleAdCopy: {
        headline: string;
        body: string;
    }[];
    kpis: string[];
}

export interface SeoMetadata {
    title: string;
    description: string;
}