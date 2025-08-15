import React, { useState } from 'react';
import ToolsL2Sidebar from './modules/tools/components/ToolsL2Sidebar';
import KnowledgeBaseL2Sidebar from './modules/knowledgebase/components/KnowledgeBaseL2Sidebar';
import ConciergeAIL2Sidebar from './modules/conciergeai/components/ConciergeAIL2Sidebar';
import CRML2Sidebar from './modules/crm/components/CRML2Sidebar';
import SystemSettingsL2Sidebar from './modules/systemsettings/components/SystemSettingsL2Sidebar';
import StudentL2Sidebar from './modules/schoolhub/student/components/StudentL2Sidebar';
import TeacherL2Sidebar from './modules/schoolhub/teacher/components/TeacherL2Sidebar';
import ParentL2Sidebar from './modules/schoolhub/parent/components/ParentL2Sidebar';
import AdministrationL2Sidebar from './modules/schoolhub/administration/components/AdministrationL2Sidebar';
import FinanceL2Sidebar from './modules/schoolhub/finance/components/FinanceL2Sidebar';
import MarketingL2Sidebar from './modules/schoolhub/marketing/components/MarketingL2Sidebar';
import SchoolL2Sidebar from './modules/schoolhub/school/components/SchoolL2Sidebar';
import { ToolsSection } from './modules/tools/types';
import { KnowledgeBaseSection } from './modules/knowledgebase/types';
import { ConciergeAISection } from './modules/conciergeai/types';
import { CRMSection } from './modules/crm/types';
import { SystemSettingsSection } from './modules/systemsettings/types';

const App: React.FC = () => {
    const [toolsSection, setToolsSection] = useState<ToolsSection>('Overview');
    const [knowledgeSection, setKnowledgeSection] = useState<KnowledgeBaseSection>('Curriculum');
    const [conciergeSection, setConciergeSection] = useState<ConciergeAISection>('Schools');
    const [crmSection, setCrmSection] = useState<CRMSection>('Dashboard');
    const [settingsSection, setSettingsSection] = useState<SystemSettingsSection>('General');
    
    // SchoolHub role states
    const [studentItem, setStudentItem] = useState('ai-learning-guide');
    const [teacherItem, setTeacherItem] = useState('staff-store');
    const [parentItem, setParentItem] = useState('online-shop');
    const [adminItem, setAdminItem] = useState('central-procurement');
    const [financeItem, setFinanceItem] = useState('revenue-analytics');
    const [marketingItem, setMarketingItem] = useState('enrollment-funnel');
    const [schoolItem, setSchoolItem] = useState('school-directory');

    // Mock nav items for SchoolHub roles
    const studentNavItems = [
        { id: 'ai-learning-guide', label: 'AI Learning Guide' },
        { id: 'learning-pathways', label: 'Learning Pathways' },
        { id: 'gamified-growth', label: 'Gamified Growth Map' },
        { id: 'calendar-todo', label: 'Calendar & To-Do' },
        { id: 'growth-journal', label: 'Personal Growth Journal' },
    ];

    const teacherNavItems = [
        { id: 'staff-store', label: 'Staff Store' },
        { id: 'ai-insights', label: 'AI Classroom Insights' },
        { id: 'gap-detector', label: 'Smart Gap Detector' },
        { id: 'grading-assistant', label: 'AI-Assisted Grading' },
        { id: 'resource-hub', label: 'Resource Hub' },
    ];

    const parentNavItems = [
        { id: 'online-shop', label: 'Online Shop' },
        { id: 'accommodation', label: 'Accommodation Booking' },
        { id: 'concierge', label: 'Personalized Concierge' },
        { id: 'communication-hub', label: 'Communication Hub' },
        { id: 'learning-tracker', label: 'Learning Pulse Tracker' },
    ];

    const adminNavItems = [
        { id: 'central-procurement', label: 'Central Procurement Hub' },
        { id: 'maintenance', label: 'Maintenance Management' },
        { id: 'analytics', label: 'Strategic Analytics' },
        { id: 'scheduling', label: 'Smart Scheduling' },
        { id: 'safety-compliance', label: 'Safety Compliance' },
    ];

    const financeNavItems = [
        { id: 'revenue-analytics', label: 'Revenue Analytics' },
        { id: 'expense-management', label: 'Expense Management' },
        { id: 'cost-efficiency', label: 'Cost Efficiency AI' },
        { id: 'financial-aid', label: 'Financial Aid Management' },
        { id: 'investment-tracking', label: 'Investment Tracking' },
    ];

    const marketingNavItems = [
        { id: 'enrollment-funnel', label: 'Enrollment Funnel' },
        { id: 'persona-campaigns', label: 'Persona-Based Campaigns' },
        { id: 'social-proof', label: 'Social Proof Stream' },
        { id: 'roi-tracker', label: 'Marketing ROI Tracker' },
        { id: 'reputation-monitoring', label: 'Reputation Monitoring' },
    ];

    const schoolNavItems = [
        { id: 'school-directory', label: 'School Directory' },
        { id: 'colleges', label: 'Colleges' },
        { id: 'departments', label: 'Departments' },
        { id: 'courses', label: 'Courses' },
        { id: 'staff-directory', label: 'Staff Directory' },
        { id: 'academic-calendar', label: 'Academic Calendar' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Level-2 Sidebar Components</h1>
                
                {/* Main Module L2 Sidebars */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-cyan-400 mb-6 text-center">Main Module L2 Sidebars</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {/* Tools L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Tools</h3>
                            <div className="h-80 flex justify-center">
                                <ToolsL2Sidebar 
                                    activeSection={toolsSection} 
                                    setActiveSection={setToolsSection} 
                                />
                            </div>
                        </div>

                        {/* KnowledgeBase L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Knowledge Base</h3>
                            <div className="h-80 flex justify-center">
                                <KnowledgeBaseL2Sidebar 
                                    activeSection={knowledgeSection} 
                                    setActiveSection={setKnowledgeSection} 
                                />
                            </div>
                        </div>

                        {/* ConciergeAI L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Concierge AI</h3>
                            <div className="h-80 flex justify-center">
                                <ConciergeAIL2Sidebar 
                                    activeSection={conciergeSection} 
                                    setActiveSection={setConciergeSection} 
                                />
                            </div>
                        </div>

                        {/* CRM L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">CRM</h3>
                            <div className="h-80 flex justify-center">
                                <CRML2Sidebar 
                                    activeSection={crmSection} 
                                    setActiveSection={setCrmSection} 
                                />
                            </div>
                        </div>

                        {/* SystemSettings L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">System Settings</h3>
                            <div className="h-80 flex justify-center">
                                <SystemSettingsL2Sidebar 
                                    activeSection={settingsSection} 
                                    setActiveSection={setSettingsSection} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SchoolHub Role L2 Sidebars */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">SchoolHub Role L2 Sidebars (Enhanced Width)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Student L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Student</h3>
                            <div className="h-80 flex justify-center">
                                <StudentL2Sidebar 
                                    activeItem={studentItem} 
                                    setActiveItem={setStudentItem} 
                                    navItems={studentNavItems} 
                                />
                            </div>
                        </div>

                        {/* Teacher L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Teacher</h3>
                            <div className="h-80 flex justify-center">
                                <TeacherL2Sidebar 
                                    activeItem={teacherItem} 
                                    setActiveItem={setTeacherItem} 
                                    navItems={teacherNavItems} 
                                />
                            </div>
                        </div>

                        {/* Parent L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Parent</h3>
                            <div className="h-80 flex justify-center">
                                <ParentL2Sidebar 
                                    activeItem={parentItem} 
                                    setActiveItem={setParentItem} 
                                    navItems={parentNavItems} 
                                />
                            </div>
                        </div>

                        {/* Administration L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Administration</h3>
                            <div className="h-80 flex justify-center">
                                <AdministrationL2Sidebar 
                                    activeItem={adminItem} 
                                    setActiveItem={setAdminItem} 
                                    navItems={adminNavItems} 
                                />
                            </div>
                        </div>

                        {/* Finance L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Finance</h3>
                            <div className="h-80 flex justify-center">
                                <FinanceL2Sidebar 
                                    activeItem={financeItem} 
                                    setActiveItem={setFinanceItem} 
                                    navItems={financeNavItems} 
                                />
                            </div>
                        </div>

                        {/* Marketing L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Marketing</h3>
                            <div className="h-80 flex justify-center">
                                <MarketingL2Sidebar 
                                    activeItem={marketingItem} 
                                    setActiveItem={setMarketingItem} 
                                    navItems={marketingNavItems} 
                                />
                            </div>
                        </div>

                        {/* School L2 Sidebar */}
                        <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">School</h3>
                            <div className="h-80 flex justify-center">
                                <SchoolL2Sidebar 
                                    activeItem={schoolItem} 
                                    setActiveItem={setSchoolItem} 
                                    navItems={schoolNavItems} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Sections Display */}
                <div className="bg-black/30 rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-2xl font-semibold text-white mb-4 text-center">Active Sections</h3>
                    
                    {/* Main Modules */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-cyan-400 mb-3">Main Modules</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                            <div className="bg-purple-600/20 rounded-lg p-3">
                                <p className="text-purple-300 text-sm font-medium">Tools</p>
                                <p className="text-white font-semibold">{toolsSection}</p>
                            </div>
                            <div className="bg-purple-600/20 rounded-lg p-3">
                                <p className="text-purple-300 text-sm font-medium">Knowledge Base</p>
                                <p className="text-white font-semibold">{knowledgeSection}</p>
                            </div>
                            <div className="bg-purple-600/20 rounded-lg p-3">
                                <p className="text-purple-300 text-sm font-medium">Concierge AI</p>
                                <p className="text-white font-semibold">{conciergeSection}</p>
                            </div>
                            <div className="bg-purple-600/20 rounded-lg p-3">
                                <p className="text-purple-300 text-sm font-medium">CRM</p>
                                <p className="text-white font-semibold">{crmSection}</p>
                            </div>
                            <div className="bg-purple-600/20 rounded-lg p-3">
                                <p className="text-purple-300 text-sm font-medium">System Settings</p>
                                <p className="text-white font-semibold">{settingsSection}</p>
                            </div>
                        </div>
                    </div>

                    {/* SchoolHub Roles */}
                    <div>
                        <h4 className="text-lg font-medium text-green-400 mb-3">SchoolHub Roles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 text-center">
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Student</p>
                                <p className="text-white font-semibold text-xs">{studentNavItems.find(item => item.id === studentItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Teacher</p>
                                <p className="text-white font-semibold text-xs">{teacherNavItems.find(item => item.id === teacherItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Parent</p>
                                <p className="text-white font-semibold text-xs">{parentNavItems.find(item => item.id === parentItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Administration</p>
                                <p className="text-white font-semibold text-xs">{adminNavItems.find(item => item.id === adminItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Finance</p>
                                <p className="text-white font-semibold text-xs">{financeNavItems.find(item => item.id === financeItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">Marketing</p>
                                <p className="text-white font-semibold text-xs">{marketingNavItems.find(item => item.id === marketingItem)?.label}</p>
                            </div>
                            <div className="bg-green-600/20 rounded-lg p-3">
                                <p className="text-green-300 text-sm font-medium">School</p>
                                <p className="text-white font-semibold text-xs">{schoolNavItems.find(item => item.id === schoolItem)?.label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;