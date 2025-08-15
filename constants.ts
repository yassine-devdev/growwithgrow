
import { ModuleType, ModuleInfo, ModuleSection } from './types';

// Import sections from their new module-specific type files
import { DashboardSection } from './modules/dashboard/types';
import { SchoolHubSection } from './modules/schoolhub/types';
import { ToolsSection, ToolsOverviewSection, ToolsMarketingL3Section, ToolsMarketingL4_SEOSection, ToolsMarketingL4_AdsSection, ToolsMarketingL4_SocialSection, ToolsMarketingL4_ContentSection, ToolsMarketingL4_AnalyticsSection, ToolsMarketingL4_AutomationSection, ToolsMarketingL4_BonusSection, ToolsFinanceSection, ToolsAISection, ToolsSettingSection } from './modules/tools/types';
import { CommunicationsSection, BlogSection } from './modules/communications/types';
import {
    KnowledgeBaseSection, KnowledgeBaseCurriculumSection,
    KnowledgeBaseAISearchSection,
    KnowledgeBaseAssessmentsL3Section,
    KnowledgeBaseStoreSection, KnowledgeBaseStoreL4Section
} from './modules/knowledgebase/types';
import { ConciergeAISection, ConciergeAISchoolsSection, ConciergeAISystemPromptsSection, ConciergeAIUsageAnalyticsSection, ConciergeAIGlobalSettingsSection, ConciergeAIChatSection } from './modules/conciergeai/types';
import { CRMSection, CRMDashboardSection, CRMContactsSection, CRMDealsSection, CRMAnalyticsSection, CRMSettingsSection, CRMSchoolSection } from './modules/crm/types';
import { MarketplaceSection, MarketplaceL3Section } from './modules/marketplace/types';
import { SystemSettingsSection, SystemSettingsGeneralSection, SystemSettingsUsersSection, SystemSettingsSecurityL3Section, SystemSettingsThemeL3Section, SystemSettingsIntegrationsSection, SystemSettingsBrandingSection } from './modules/systemsettings/types';
import { LeisureLifestyleSection, BookingAccommodationL3Section, FlightsL3Section, FoodL3Section, EventsL3Section, ServicesL3Section, MovingStorageL4Section, CleaningServicesL4Section, MaintenanceHandymanL4Section, ACServicesL4Section, PestControlL4Section, GardeningL4Section, NannyMaidL4Section, ServicesL4Section, SpaGymL3Section, LocalL3Section } from './modules/lifestyle/types';
import { HobbiesSection } from './modules/hobbies/types';
import { LeisureSection } from './modules/leisure/types';
import { GamificationSection } from './modules/gamification/types';
import { MediaSection } from './modules/media/types';
import { StudioSection } from './modules/studio/types';
import { College } from './modules/schoolhub/types';


import { DashboardIcon } from './modules/dashboard/Icon';
import { ToolsIcon } from './modules/tools/Icon';
import { SchoolIcon } from './modules/schoolhub/Icon';
import { CommsIcon } from './modules/communications/Icon';
import { KnowledgeIcon } from './modules/knowledgebase/Icon';
import { ConciergeIcon } from './modules/conciergeai/Icon';
import { MarketIcon } from './modules/marketplace/Icon';
import { SettingsIcon } from './modules/systemsettings/Icon';
import { CRMIcon } from './modules/crm/Icon';
import { LifestyleIcon } from './modules/lifestyle/Icon';
import { HobbiesIcon } from './modules/hobbies/Icon';
import { LeisureIcon } from './modules/leisure/Icon';
import { GamificationIcon } from './modules/gamification/Icon';
import { MediaIcon } from './modules/media/Icon';
import { StudioIcon } from './modules/studio/Icon';

export const MAIN_MODULES: ModuleInfo[] = [
  { id: ModuleType.Dashboard, title: 'Dashboard', icon: DashboardIcon },
  { id: ModuleType.Tools, title: 'Tools', icon: ToolsIcon },
  { id: ModuleType.SchoolHub, title: 'School Hub', icon: SchoolIcon },
  { id: ModuleType.Communications, title: 'Comms', icon: CommsIcon },
  { id: ModuleType.KnowledgeBase, title: 'Knowledge', icon: KnowledgeIcon },
  { id: ModuleType.ConciergeAI, title: 'Concierge', icon: ConciergeIcon },
  { id: ModuleType.CRM, title: 'CRM', icon: CRMIcon },
  { id: ModuleType.SystemSettings, title: 'Settings', icon: SettingsIcon },
];

export const PERSONAL_MODULES: ModuleInfo[] = [
    { id: ModuleType.LeisureLifestyle, title: "Leisure & Lifestyle", icon: LifestyleIcon },
    { id: ModuleType.Hobbies, title: "Hobbies", icon: HobbiesIcon },
    { id: ModuleType.Leisure, title: "Directories", icon: LeisureIcon },
    { id: ModuleType.Gamification, title: "Gamification", icon: GamificationIcon },
    { id: ModuleType.Media, title: "Media", icon: MediaIcon },
    { id: ModuleType.Studio, title: "Studio", icon: StudioIcon },
    { id: ModuleType.Marketplace, title: 'Market', icon: MarketIcon },
];

export const MODULES: ModuleInfo[] = [...MAIN_MODULES, ...PERSONAL_MODULES];

// L2 Sections
export const DASHBOARD_SECTIONS: DashboardSection[] = ['Overview', 'Analytics', 'Reports'];
export const SCHOOL_HUB_SECTIONS: SchoolHubSection[] = ['School', 'Student', 'Parent', 'Teacher', 'Administration', 'Finance', 'Marketing'];
export const TOOLS_SECTIONS: ToolsSection[] = ['Overview', 'Marketing', 'Finance', 'AI', 'Setting'];
export const COMMUNICATIONS_SECTIONS: CommunicationsSection[] = ['Email', 'Templates', 'Calendar', 'Announcements', 'Video Calls', 'Blog'];
export const KNOWLEDGE_BASE_SECTIONS: KnowledgeBaseSection[] = ['Curriculum', 'Assessments', 'Library', 'AI Search', 'Store'];
export const CONCIERGE_AI_SECTIONS: ConciergeAISection[] = ['Schools', 'System Prompts', 'Usage Analytics', 'Global Settings', 'Chat'];
export const CRM_SECTIONS: CRMSection[] = ['Dashboard', 'Contacts', 'Deals', 'Analytics', 'Settings', 'School'];
export const MARKETPLACE_SECTIONS: MarketplaceSection[] = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Deals'];
export const SYSTEM_SETTINGS_SECTIONS: SystemSettingsSection[] = ['General', 'Users', 'Security', 'Integrations', 'Branding', 'Theme'];
export const LEISURE_LIFESTYLE_SECTIONS: LeisureLifestyleSection[] = ['Booking & Accommodation', 'Flights', 'Food', 'Events', 'Services', 'Spa & Gym', 'Local'];
export const HOBBIES_SECTIONS: HobbiesSection[] = ['Performing Arts', 'Writing and Literature', 'Outdoor Activities', 'Arts and Crafts', 'Collecting'];
export const LEISURE_SECTIONS: LeisureSection[] = ['Watchlist', 'My Reviews', 'Recommendations'];
export const GAMIFICATION_SECTIONS: GamificationSection[] = ['Profile', 'Leaderboards', 'Achievements'];
export const MEDIA_SECTIONS: MediaSection[] = ['Movies', 'Series', 'Anime', 'Documentaries', 'Live TV'];
export const STUDIO_SECTIONS: StudioSection[] = ['Designer', 'Images', 'Video', 'Coder', 'Office', 'Setting'];

// L3 Sections
export const CRM_DASHBOARD_SECTIONS_L3: CRMDashboardSection[] = ['Overview', 'Team Performance', 'My Tasks'];
export const CRM_CONTACTS_SECTIONS_L3: CRMContactsSection[] = ['All Contacts', 'Companies', 'Lists', 'Import/Export'];
export const CRM_DEALS_SECTIONS_L3: CRMDealsSection[] = ['Pipeline View', 'List View', 'Forecasting'];
export const CRM_ANALYTICS_SECTIONS_L3: CRMAnalyticsSection[] = ['Sales Reports', 'Activity Reports', 'Lead Sources'];
export const CRM_SETTINGS_SECTIONS_L3: CRMSettingsSection[] = ['Pipeline', 'Properties', 'Team'];
export const CRM_SCHOOL_SECTIONS_L3: CRMSchoolSection[] = ['All Schools', 'Add School', 'Data Import', 'Preferences', 'Billing & Subscriptions', 'Analytics'];

export const SYSTEM_SETTINGS_GENERAL_SECTIONS_L3: SystemSettingsGeneralSection[] = ["Profile", "Appearance", "Localization", "AI"];
export const SYSTEM_SETTINGS_USERS_SECTIONS_L3: SystemSettingsUsersSection[] = ["All Users", "Roles & Permissions", "Invitations"];
export const SYSTEM_SETTINGS_SECURITY_CORE_L3: SystemSettingsSecurityL3Section[] = ['Access Policies', 'MFA', 'Audit Logs'];
export const SYSTEM_SETTINGS_SECURITY_INNOVATION_L3: SystemSettingsSecurityL3Section[] = ['Threat Console (Live)', 'Behavioral Anomaly Detection (AI)', 'Security Playbooks'];
export const SYSTEM_SETTINGS_INTEGRATIONS_SECTIONS_L3: SystemSettingsIntegrationsSection[] = ["Connected Apps", "API Keys", "Webhooks"];
export const SYSTEM_SETTINGS_BRANDING_SECTIONS_L3: SystemSettingsBrandingSection[] = ["Logo & Colors", "Email Templates", "Login Screen"];
export const SYSTEM_SETTINGS_THEME_SECTIONS_L3: SystemSettingsThemeL3Section[] = ['Appearance', 'Layout', 'Effects', 'Accessibility'];

export const TOOLS_OVERVIEW_SECTIONS_L3: ToolsOverviewSection[] = ["Key Dashboards", "Custom Reports", "Data Sources", "Causal Inference (AI)", "Scenario Forecast", "Data Storyteller (AI)"];
export const TOOLS_MARKETING_SECTIONS_L3: ToolsMarketingL3Section[] = ["SEO Command Center", "Advertising Hub", "Social Media Suite", "Content Marketing Tools", "Analytics & Reporting", "Automation & AI Assistance", "Bonus Power Tools"];
export const TOOLS_FINANCE_SECTIONS_L3: ToolsFinanceSection[] = ["Expense Tracker", "Invoice Generator", "Budget Forecaster"];
export const TOOLS_AI_SECTIONS_L3: ToolsAISection[] = ["Text Generator", "Chart Generator", "Image Generator"];
export const TOOLS_SETTING_SECTIONS_L3: ToolsSettingSection[] = ["API Keys", "Usage Limits", "Defaults"];

export const CONCIERGE_AI_SCHOOLS_SECTIONS_L3: ConciergeAISchoolsSection[] = ["Manage Schools", "Onboarding", "Analytics"];
export const CONCIERGE_AI_SYSTEM_PROMPTS_SECTIONS_L3: ConciergeAISystemPromptsSection[] = ["Prompt Library", "Create New Prompt", "Performance"];
export const CONCIERGE_AI_USAGE_ANALYTICS_SECTIONS_L3: ConciergeAIUsageAnalyticsSection[] = ["Overall Usage", "By School", "Cost Analysis"];
export const CONCIERGE_AI_GLOBAL_SETTINGS_SECTIONS_L3: ConciergeAIGlobalSettingsSection[] = ["Model Configuration", "Safety Filters", "Data Retention"];
export const CONCIERGE_AI_CHAT_SECTIONS_L3: ConciergeAIChatSection[] = ["Chat", "Report", "Automation"];

export const KNOWLEDGE_BASE_CURRICULUM_SECTIONS_L3: KnowledgeBaseCurriculumSection[] = ["Browse", "Standards Alignment", "Version History"];
export const KNOWLEDGE_BASE_ASSESSMENTS_L3_CORE_SECTIONS: KnowledgeBaseAssessmentsL3Section[] = ['Create New', 'Question Bank', 'View Results'];
export const KNOWLEDGE_BASE_ASSESSMENTS_L3_INNOVATION_SECTIONS: KnowledgeBaseAssessmentsL3Section[] = ['Generative Assessments (AI)', 'Adaptive Testing Engine', 'Integrity Shield (AI)'];
export const KNOWLEDGE_BASE_AI_SEARCH_SECTIONS_L3: KnowledgeBaseAISearchSection[] = ["Search Interface", "Analytics", "Settings"];

export const KNOWLEDGE_BASE_STORE_L3_SECTIONS: KnowledgeBaseStoreSection[] = ['Books', 'Courses', 'Exams'];

export const COMMUNICATIONS_BLOG_SECTIONS_L3: BlogSection[] = ['All Posts', 'Categories', 'Analytics'];

// New L3 Sections for Leisure & Lifestyle
export const BOOKING_ACCOMMODATION_SECTIONS_L3: BookingAccommodationL3Section[] = ['Hotels', 'Vacation Rentals', 'Hostels', 'Homestays'];
export const FLIGHTS_SECTIONS_L3: FlightsL3Section[] = ['Search', 'My Trips', 'Deals', 'Check-in'];
export const FOOD_SECTIONS_L3: FoodL3Section[] = ['Restaurants', 'Delivery', 'Groceries', 'Recipes'];
export const EVENTS_SECTIONS_L3: EventsL3Section[] = ['Concerts', 'Sports', 'Theatre', 'Expos'];
export const SERVICES_SECTIONS_L3: ServicesL3Section[] = ['Moving & Storage', 'Cleaning Services', 'Maintenance & Handyman', 'AC Services', 'Pest Control', 'Gardening', 'Nanny & Maid Services', 'Automotive', 'Professional'];
export const SPA_GYM_SECTIONS_L3: SpaGymL3Section[] = ['Spa', 'Gyms', 'Coaches', 'Booking'];
export const LOCAL_SECTIONS_L3: LocalL3Section[] = ['Attractions', 'Guides', 'Tours', 'Offers'];

// L4 Sections for Tools -> Marketing
export const TOOLS_MARKETING_L4_SEO_SECTIONS: ToolsMarketingL4_SEOSection[] = ["SEO", "Research", "Generator", "Competitor", "Backlink", "Local"];
export const TOOLS_MARKETING_L4_ADS_SECTIONS: ToolsMarketingL4_AdsSection[] = ["Multi-Platform", "Ad Copy", "Creative", "Budget", "A/B Testing", "Retargeting", "ROI", "Audience"];
export const TOOLS_MARKETING_L4_SOCIAL_SECTIONS: ToolsMarketingL4_SocialSection[] = ["Calendar", "AI Post", "Trends", "Competitor", "Inbox", "Shorts", "Listening"];
export const TOOLS_MARKETING_L4_CONTENT_SECTIONS: ToolsMarketingL4_ContentSection[] = ["Blog Ideas", "AI Writer", "Performance", "Repurpose", "Email Automation", "Newsletter"];
export const TOOLS_MARKETING_L4_ANALYTICS_SECTIONS: ToolsMarketingL4_AnalyticsSection[] = ["Dashboard", "Funnel", "Heatmaps", "KPIs", "Alerts"];
export const TOOLS_MARKETING_L4_AUTOMATION_SECTIONS: ToolsMarketingL4_AutomationSection[] = ["Scheduler", "Tags", "Planner", "Chatbot", "CRM"];
export const TOOLS_MARKETING_L4_BONUS_SECTIONS: ToolsMarketingL4_BonusSection[] = ["Influencer", "Voice SEO", "Branding", "Predictor", "Reputation", "Competitor Ads", "Market Radar"];

// L4 Sections for Knowledge Base -> Store
export const KNOWLEDGE_BASE_STORE_BOOKS_L4_SECTIONS: KnowledgeBaseStoreL4Section[] = ['Search', 'Filter', 'Categories', 'View Details'];
export const KNOWLEDGE_BASE_STORE_COURSES_L4_SECTIONS: KnowledgeBaseStoreL4Section[] = ['Search', 'Filter', 'View Syllabus', 'Enroll'];
export const KNOWLEDGE_BASE_STORE_EXAMS_L4_SECTIONS: KnowledgeBaseStoreL4Section[] = ['Practice Tests', 'Timed Exams', 'Results', 'Difficulty'];

// L4 Sections for Leisure & Lifestyle -> Services
export const MOVING_STORAGE_SECTIONS_L4: MovingStorageL4Section[] = ['Local Moving', 'International Moving', 'Storage Solutions', 'Office & Villa Relocation', 'Car Shipping'];
export const CLEANING_SERVICES_SECTIONS_L4: CleaningServicesL4Section[] = ['Home Cleaning', 'Deep Cleaning', 'Upholstery Cleaning', 'Laundry Service', 'Office Cleaning'];
export const MAINTENANCE_HANDYMAN_SECTIONS_L4: MaintenanceHandymanL4Section[] = ['General Repairs', 'Carpentry', 'Plumbing Services', 'Electrical Services', 'Furniture Assembly', 'TV Mounting', 'Locksmith Services'];
export const AC_SERVICES_SECTIONS_L4: ACServicesL4Section[] = ['AC Filter Cleaning', 'AC Duct Cleaning', 'AC Repair', 'AC Installation'];
export const PEST_CONTROL_SECTIONS_L4: PestControlL4Section[] = ['Rodent Control', 'Insect Control', 'General Pest Control'];
export const GARDENING_SECTIONS_L4: GardeningL4Section[] = ['Lawn Care', 'Landscaping Design', 'Pool & Water Features'];
export const NANNY_MAID_SECTIONS_L4: NannyMaidL4Section[] = ['Full-time Maid Service', 'Full-time Nanny Service'];


export const MODULE_SECTIONS: Partial<Record<ModuleType, ModuleSection[]>> = {
  [ModuleType.Dashboard]: DASHBOARD_SECTIONS,
  [ModuleType.SchoolHub]: SCHOOL_HUB_SECTIONS,
  [ModuleType.Tools]: TOOLS_SECTIONS,
  [ModuleType.Communications]: COMMUNICATIONS_SECTIONS,
  [ModuleType.KnowledgeBase]: KNOWLEDGE_BASE_SECTIONS,
  [ModuleType.ConciergeAI]: CONCIERGE_AI_SECTIONS,
  [ModuleType.CRM]: CRM_SECTIONS,
  [ModuleType.Marketplace]: MARKETPLACE_SECTIONS,
  [ModuleType.SystemSettings]: SYSTEM_SETTINGS_SECTIONS,
  [ModuleType.LeisureLifestyle]: LEISURE_LIFESTYLE_SECTIONS,
  [ModuleType.Hobbies]: HOBBIES_SECTIONS,
  [ModuleType.Leisure]: LEISURE_SECTIONS,
  [ModuleType.Gamification]: GAMIFICATION_SECTIONS,
  [ModuleType.Media]: MEDIA_SECTIONS,
  [ModuleType.Studio]: STUDIO_SECTIONS,
};

export const SYSTEM_SETTINGS_L3_MAP: Partial<Record<SystemSettingsSection, ModuleSection[]>> = {
  'General': SYSTEM_SETTINGS_GENERAL_SECTIONS_L3,
  'Users': SYSTEM_SETTINGS_USERS_SECTIONS_L3,
  'Integrations': SYSTEM_SETTINGS_INTEGRATIONS_SECTIONS_L3,
  'Branding': SYSTEM_SETTINGS_BRANDING_SECTIONS_L3,
};

export const TOOLS_L3_MAP: Partial<Record<ToolsSection, ModuleSection[]>> = {
  'Overview': TOOLS_OVERVIEW_SECTIONS_L3,
  'Marketing': TOOLS_MARKETING_SECTIONS_L3,
  'Finance': TOOLS_FINANCE_SECTIONS_L3,
  'AI': TOOLS_AI_SECTIONS_L3,
  'Setting': TOOLS_SETTING_SECTIONS_L3,
};

export const TOOLS_MARKETING_L4_MAP: Partial<Record<ToolsMarketingL3Section, ModuleSection[]>> = {
    "SEO Command Center": TOOLS_MARKETING_L4_SEO_SECTIONS,
    "Advertising Hub": TOOLS_MARKETING_L4_ADS_SECTIONS,
    "Social Media Suite": TOOLS_MARKETING_L4_SOCIAL_SECTIONS,
    "Content Marketing Tools": TOOLS_MARKETING_L4_CONTENT_SECTIONS,
    "Analytics & Reporting": TOOLS_MARKETING_L4_ANALYTICS_SECTIONS,
    "Automation & AI Assistance": TOOLS_MARKETING_L4_AUTOMATION_SECTIONS,
    "Bonus Power Tools": TOOLS_MARKETING_L4_BONUS_SECTIONS,
};

export const CONCIERGE_AI_L3_MAP: Partial<Record<ConciergeAISection, ModuleSection[]>> = {
  'Schools': CONCIERGE_AI_SCHOOLS_SECTIONS_L3,
  'System Prompts': CONCIERGE_AI_SYSTEM_PROMPTS_SECTIONS_L3,
  'Usage Analytics': CONCIERGE_AI_USAGE_ANALYTICS_SECTIONS_L3,
  'Global Settings': CONCIERGE_AI_GLOBAL_SETTINGS_SECTIONS_L3,
  'Chat': CONCIERGE_AI_CHAT_SECTIONS_L3,
};

export const KNOWLEDGE_BASE_L3_MAP: Partial<Record<KnowledgeBaseSection, ModuleSection[]>> = {
  'Curriculum': KNOWLEDGE_BASE_CURRICULUM_SECTIONS_L3,
  'AI Search': KNOWLEDGE_BASE_AI_SEARCH_SECTIONS_L3,
};

export const KNOWLEDGE_BASE_STORE_L4_MAP: Partial<Record<KnowledgeBaseStoreSection, KnowledgeBaseStoreL4Section[]>> = {
  'Books': KNOWLEDGE_BASE_STORE_BOOKS_L4_SECTIONS,
  'Courses': KNOWLEDGE_BASE_STORE_COURSES_L4_SECTIONS,
  'Exams': KNOWLEDGE_BASE_STORE_EXAMS_L4_SECTIONS,
};

export const MARKETPLACE_L3_MAP: Partial<Record<MarketplaceSection, MarketplaceL3Section[]>> = {
  'All': ['Featured', 'New Arrivals', 'Popular'],
  'Electronics': ['Smartphones', 'Laptops', 'Accessories'],
  'Clothing': ['Men', 'Women', 'Kids'],
  'Books': ['Fiction', 'Non-Fiction', 'Educational'],
  'Home & Garden': ['Furniture', 'Decor', 'Garden'],
  'Deals': ['Daily Deals', 'Flash Sales', 'Clearance'],
};

export const LEISURE_LIFESTYLE_L3_MAP: Partial<Record<LeisureLifestyleSection, ModuleSection[]>> = {
  'Booking & Accommodation': BOOKING_ACCOMMODATION_SECTIONS_L3,
  'Flights': FLIGHTS_SECTIONS_L3,
  'Food': FOOD_SECTIONS_L3,
  'Events': EVENTS_SECTIONS_L3,
  'Services': SERVICES_SECTIONS_L3,
  'Spa & Gym': SPA_GYM_SECTIONS_L3,
  'Local': LOCAL_SECTIONS_L3,
};

export const SERVICES_L4_MAP: Partial<Record<ServicesL3Section, ServicesL4Section[]>> = {
    'Moving & Storage': MOVING_STORAGE_SECTIONS_L4,
    'Cleaning Services': CLEANING_SERVICES_SECTIONS_L4,
    'Maintenance & Handyman': MAINTENANCE_HANDYMAN_SECTIONS_L4,
    'AC Services': AC_SERVICES_SECTIONS_L4,
    'Pest Control': PEST_CONTROL_SECTIONS_L4,
    'Gardening': GARDENING_SECTIONS_L4,
    'Nanny & Maid Services': NANNY_MAID_SECTIONS_L4,
};

export const GAMIFICATION_DATA = [
    {
        category: 'Player',
        items: ['Profile', 'Achievements']
    },
    {
        category: 'Community',
        items: ['Leaderboards']
    }
];

export const LEISURE_DATA = [
    {
        category: 'Personal',
        items: ['Watchlist', 'My Reviews']
    },
    {
        category: 'Discovery',
        items: ['Recommendations']
    }
];

export const HOBBY_DATA = [
    {
        category: 'Performing Arts' as HobbiesSection,
        items: [
            'Painting (acrylic, watercolor, oil)', 'Drawing/sketching', 'Pottery', 'Sculpting', 'Origami', 
            'Scrapbooking', 'Jewelry making', 'Knitting', 'Crocheting', 'Sewing', 'Quilting', 'Embroidery', 
            'Calligraphy', 'Paper crafting', 'Wood carving', 'Soap making', 'Candle making', 'Glass blowing', 
            'Mosaic art', 'Leatherworking'
        ]
    },
    {
        category: 'Writing and Literature' as HobbiesSection,
        items: [
            'Creative writing', 'Blogging', 'Journaling', 'Poetry', 'Novel writing', 'Short story writing', 
            'Screenwriting', 'Letter writing', 'Editing', 'Bookbinding'
        ]
    },
    {
        category: 'Outdoor Activities' as HobbiesSection,
        items: [
            'Gardening', 'Hiking', 'Bird watching', 'Camping', 'Geocaching', 'Rock climbing', 'Fishing', 
            'Kayaking', 'Surfing', 'Cycling'
        ]
    },
    {
        category: 'Arts and Crafts' as HobbiesSection,
        items: [
            'Playing a musical instrument', 'Singing', 'Dancing (e.g., salsa, hip-hop, ballet)', 'Acting', 
            'Stand-up comedy', 'Magic tricks', 'Puppetry', 'Beatboxing', 'Mime art', 'Spoken word poetry'
        ]
    },
    {
        category: 'Collecting' as HobbiesSection,
        items: [
            'Stamp collecting', 'Coin collecting', 'Vintage items', 'Action figures', 'Postcards', 'Antiques', 
            'Fossils', 'Seashells', 'Comic books', 'Trading cards'
        ]
    }
];

export const STUDIO_DATA = [
    {
        category: 'Designer' as StudioSection,
        items: ['UI/UX', 'Graphic Design', '3D Modeling', 'Vector Art', 'Prototypes', 'Editor']
    },
    {
        category: 'Images' as StudioSection,
        items: ['Gallery', 'Editor', 'AI Generator', 'Filters & Effects', 'Batch Processor']
    },
    {
        category: 'Video' as StudioSection,
        items: ['Player', 'Editor', 'Shorts', 'Converter', 'Streaming']
    },
    {
        category: 'Coder' as StudioSection,
        items: ['IDE', 'Playground', 'Debugger', 'Git Client', 'API Tester']
    },
    {
        category: 'Office' as StudioSection,
        items: ['Docs', 'Sheets', 'Slides', 'PDF Viewer', 'Notes']
    },
    {
        category: 'Setting' as StudioSection,
        items: ['General', 'Plugins', 'Export Options', 'Cloud Sync', 'Preferences']
    }
];

export const MEDIA_DATA = [
    {
        category: 'Movies' as MediaSection,
        items: ['Featured', 'My List', 'Genres', 'New Releases', 'Search']
    },
    {
        category: 'Series' as MediaSection,
        items: ['Featured', 'My List', 'Genres', 'Trending', 'Search']
    },
    {
        category: 'Anime' as MediaSection,
        items: ['Featured', 'My List', 'Genres', 'Top Rated', 'Search']
    },
    {
        category: 'Documentaries' as MediaSection,
        items: ['Featured', 'My List', 'Categories', 'Award Winners', 'Search']
    },
    {
        category: 'Live TV' as MediaSection,
        items: ['Guide', 'My Channels', 'Recordings', 'Search']
    }
];

export const SCHOOL_DATA: College[] = [
  {
    id: 'c1',
    name: 'College of Engineering',
    departments: [
      {
        id: 'd1a',
        name: 'Computer Science',
        courses: [
          {
            id: 'cs101', name: 'Intro to AI', code: 'CS101', staff: [
              { id: 's1', name: 'Dr. Ada Lovelace', role: 'Professor', email: 'ada.l@uni.edu' },
              { id: 's2', name: 'Dr. Alan Turing', role: 'Lecturer', email: 'alan.t@uni.edu' }
            ]
          },
          {
            id: 'cs202', name: 'Data Structures', code: 'CS202', staff: [
              { id: 's3', name: 'Dr. Grace Hopper', role: 'Professor', email: 'grace.h@uni.edu' }
            ]
          },
        ]
      },
      {
        id: 'd1b',
        name: 'Mechanical Engineering',
        courses: [
          { id: 'me101', name: 'Thermodynamics', code: 'ME101', staff: [{ id: 's4', name: 'Dr. James Watt', role: 'Professor', email: 'james.w@uni.edu' }] },
        ]
      },
    ],
  },
  {
    id: 'c2',
    name: 'College of Arts & Sciences',
    departments: [
      {
        id: 'd2a',
        name: 'Physics',
        courses: [
          { id: 'phy101', name: 'Quantum Mechanics', code: 'PHY101', staff: [{ id: 's5', name: 'Dr. Marie Curie', role: 'Professor', email: 'marie.c@uni.edu' }] },
          { id: 'phy201', name: 'Astrophysics', code: 'PHY201', staff: [{ id: 's6', name: 'Dr. Galileo Galilei', role: 'Lecturer', email: 'galileo.g@uni.edu' }] },
        ]
      },
      {
        id: 'd2b',
        name: 'History',
        courses: [
          { id: 'his101', name: 'Ancient Civilizations', code: 'HIS101', staff: [{ id: 's7', name: 'Dr. Herodotus', role: 'Professor', email: 'herodotus@uni.edu' }] },
        ]
      }
    ],
  },
];