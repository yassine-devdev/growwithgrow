
export type CRMDashboardSection = 'Overview' | 'Team Performance' | 'My Tasks';
export type CRMContactsSection = 'All Contacts' | 'Companies' | 'Lists' | 'Import/Export';
export type CRMDealsSection = 'Pipeline View' | 'List View' | 'Forecasting';
export type CRMAnalyticsSection = 'Sales Reports' | 'Activity Reports' | 'Lead Sources';
export type CRMSettingsSection = 'Pipeline' | 'Properties' | 'Team';
export type CRMSchoolSection = 'All Schools' | 'Add School' | 'Data Import' | 'Preferences' | 'Billing & Subscriptions' | 'Analytics';
export type CRMSection = 'Dashboard' | 'Contacts' | 'Deals' | 'Analytics' | 'Settings' | 'School';

export interface Deal {
    id: number;
    name: string;
    contact: string;
    company: string;
    value: number;
    stage: string;
    closeDate: string;
}

export interface Company {
    id: number;
    name: string;
    owner: string;
    industry: string;
    city: string;
    country: string;
}

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Sales Rep' | 'Manager';
}

export interface Activity {
    id: number;
    type: 'Note' | 'Call' | 'Email' | 'Meeting';
    content: string;
    date: string;
    user: string;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Lost';
    owner: string;
    activities: Activity[];
    deals: Deal[];
}

export interface School {
    id: number;
    name: string;
    admin: string;
    status: 'Active' | 'Inactive' | 'Trial';
    students: number;
    plan: 'Basic' | 'Pro' | 'Enterprise';
}
