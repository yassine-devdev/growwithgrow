
import React from 'react';
import { DashboardSection } from './modules/dashboard/types';
import { SchoolHubSection } from './modules/schoolhub/types';
import { ToolsSection, ToolsOverviewSection, ToolsMarketingL3Section, ToolsMarketingL4Section, ToolsFinanceSection, ToolsAISection, ToolsSettingSection } from './modules/tools/types';
import { CommunicationsSection } from './modules/communications/types';
import {
    KnowledgeBaseSection, KnowledgeBaseCurriculumSection,
    KnowledgeBaseAssessmentsL3Section,
    KnowledgeBaseInstitutionalDataSection, KnowledgeBaseResourceLibrarySection, KnowledgeBaseAISearchSection,
    KnowledgeBaseStoreSection, KnowledgeBaseStoreL4Section
} from './modules/knowledgebase/types';
import { ConciergeAISection, ConciergeAISchoolsSection, ConciergeAISystemPromptsSection, ConciergeAIUsageAnalyticsSection, ConciergeAIGlobalSettingsSection, ConciergeAIChatSection } from './modules/conciergeai/types';
import { CRMSection, CRMDashboardSection, CRMContactsSection, CRMDealsSection, CRMAnalyticsSection, CRMSettingsSection, CRMSchoolSection } from './modules/crm/types';
import { MarketplaceSection } from './modules/marketplace/types';
import { SystemSettingsSection, SystemSettingsGeneralSection, SystemSettingsUsersSection, SystemSettingsSecurityL3Section, SystemSettingsThemeL3Section, SystemSettingsIntegrationsSection, SystemSettingsBrandingSection } from './modules/systemsettings/types';
import { LeisureLifestyleSection, BookingAccommodationL3Section, FlightsL3Section, FoodL3Section, EventsL3Section, ServicesL3Section as OriginalServicesL3Section, SpaGymL3Section, LocalL3Section } from './modules/lifestyle/types';
import { HobbiesSection } from './modules/hobbies/types';
import { LeisureSection } from './modules/leisure/types';
import { GamificationSection } from './modules/gamification/types';
import { MediaSection } from './modules/media/types';
import { StudioSection } from './modules/studio/types';
import { UiLayout } from './modules/studio/designer/types';
import { AutomationWorkflow, AudienceSuggestion } from './modules/tools/types';
import { Deal, Company, TeamMember, Activity, Contact, School } from './modules/crm/types';
import { Staff, Course, Department, College } from './modules/schoolhub/types';
import { TMDBGenre, TMDBMedia, TMDBSeason, TMBDEpisode, TMDBMediaDetails } from './modules/media/types';

// New L3 and L4 service types
export type ServicesL3Section = 'Moving & Storage' | 'Cleaning Services' | 'Maintenance & Handyman' | 'AC Services' | 'Pest Control' | 'Gardening' | 'Nanny & Maid Services' | 'Automotive' | 'Professional';
export type MovingStorageL4Section = 'Local Moving' | 'International Moving' | 'Storage Solutions' | 'Office & Villa Relocation' | 'Car Shipping';
export type CleaningServicesL4Section = 'Home Cleaning' | 'Deep Cleaning' | 'Upholstery Cleaning' | 'Laundry Service' | 'Office Cleaning';
export type MaintenanceHandymanL4Section = 'General Repairs' | 'Carpentry' | 'Plumbing Services' | 'Electrical Services' | 'Furniture Assembly' | 'TV Mounting' | 'Locksmith Services';
export type ACServicesL4Section = 'AC Filter Cleaning' | 'AC Duct Cleaning' | 'AC Repair' | 'AC Installation';
export type PestControlL4Section = 'Rodent Control' | 'Insect Control' | 'General Pest Control';
export type GardeningL4Section = 'Lawn Care' | 'Landscaping Design' | 'Pool & Water Features';
export type NannyMaidL4Section = 'Full-time Maid Service' | 'Full-time Nanny Service';
export type ServicesL4Section = MovingStorageL4Section | CleaningServicesL4Section | MaintenanceHandymanL4Section | ACServicesL4Section | PestControlL4Section | GardeningL4Section | NannyMaidL4Section;


export enum ModuleType {
  Dashboard = 'DASHBOARD',
  Tools = 'TOOLS',
  SchoolHub = 'SCHOOL_HUB',
  Communications = 'COMMUNICATIONS',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  ConciergeAI = 'CONCIERGE_AI',
  CRM = 'CRM',
  SystemSettings = 'SYSTEM_SETTINGS',
  LeisureLifestyle = 'LEISURE_LIFESTYLE',
  Hobbies = 'HOBBIES',
  Leisure = 'LEISURE',
  Gamification = 'GAMIFICATION',
  Media = 'MEDIA',
  Studio = 'STUDIO',
  Marketplace = 'MARKETPLACE',
}

export type ModuleSection =
  DashboardSection |
  SchoolHubSection |
  ToolsSection |
  CommunicationsSection |
  KnowledgeBaseSection |
  ConciergeAISection |
  MarketplaceSection |
  SystemSettingsSection |
  LeisureLifestyleSection |
  HobbiesSection |
  LeisureSection |
  GamificationSection |
  MediaSection |
  StudioSection |
  CRMSection |
  // L3 Sections
  CRMDashboardSection | CRMContactsSection | CRMDealsSection | CRMAnalyticsSection | CRMSettingsSection | CRMSchoolSection |
  SystemSettingsGeneralSection | SystemSettingsUsersSection | SystemSettingsSecurityL3Section | SystemSettingsThemeL3Section | SystemSettingsIntegrationsSection | SystemSettingsBrandingSection |
  ToolsOverviewSection | ToolsMarketingL3Section | ToolsFinanceSection | ToolsAISection | ToolsSettingSection |
  ConciergeAISchoolsSection | ConciergeAISystemPromptsSection | ConciergeAIUsageAnalyticsSection | ConciergeAIGlobalSettingsSection | ConciergeAIChatSection |
  KnowledgeBaseCurriculumSection | KnowledgeBaseAssessmentsL3Section | KnowledgeBaseInstitutionalDataSection | KnowledgeBaseResourceLibrarySection | KnowledgeBaseAISearchSection |
  KnowledgeBaseStoreSection |
  BookingAccommodationL3Section | FlightsL3Section | FoodL3Section | EventsL3Section | OriginalServicesL3Section | SpaGymL3Section | LocalL3Section |
  ServicesL3Section |
  // L4 Sections
  ToolsMarketingL4Section |
  KnowledgeBaseStoreL4Section |
  ServicesL4Section |
  null;


export interface ModuleInfo {
  id: ModuleType;
  title: string;
  icon: React.FC<{ className?: string }>;
}


// For convenience, re-exporting module-specific types so they can be imported from here or directly.
export type {
    Staff, Course, Department, College, // School Hub
    TMDBGenre, TMDBMedia, TMDBSeason, TMBDEpisode, TMDBMediaDetails, // Media
    Deal, Company, TeamMember, Activity, Contact, School, // CRM
    AutomationWorkflow, AudienceSuggestion, // Tools
    UiLayout, // Studio
    ConciergeAISection,
    MarketplaceSection,
    CRMSection,
    CRMDashboardSection,
    CRMContactsSection,
    CRMDealsSection,
    CRMAnalyticsSection,
    CRMSettingsSection,
    CRMSchoolSection,
};
