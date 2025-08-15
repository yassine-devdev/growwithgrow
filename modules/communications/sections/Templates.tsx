
import React, { useState } from 'react';
import TemplatesL2Sidebar from '../components/TemplatesL2Sidebar';
import { TemplatesSection } from '../types';
import GlassCard from '../../../components/GlassCard';
import { PlusIcon } from '../../crm/components/Icons';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';
import AIChartCard from '../../../components/AIChartCard';
import { CloseIcon } from '../../crm/components/Icons';

// --- Data Structures ---
interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  content: string; // HTML content
  isTeam?: boolean;
}

// --- Realistic Template Content ---
const welcomeEmailContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #0a0a1a; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #141428; border: 1px solid #00ffff; border-radius: 8px; padding: 20px;">
    <h1 style="color: #00ffff;">Welcome to the System!</h1>
    <p>Hi there,</p>
    <p>We're thrilled to have you on board. You've just unlocked a powerful suite of tools designed to boost your productivity.</p>
    <p>To get started, we recommend checking out the <strong>Dashboard</strong> for an overview of your current status.</p>
    <a href="#" style="background-color: #00ffff; color: #0a0a1a; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Go to Dashboard</a>
    <p style="margin-top: 20px;">Best,<br>The System Team</p>
  </div>
</div>
`;

const newsletterContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #0a0a1a; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #141428; border: 1px solid #a855f7; border-radius: 8px; padding: 20px;">
    <h2 style="color: #a855f7;">This Week's Insights</h2>
    <h3 style="color: #e0e0e0; border-bottom: 1px solid #a855f7; padding-bottom: 5px;">New Feature: AI-Powered Campaign Planner</h3>
    <p>Our Tools module just got a major upgrade! You can now generate comprehensive marketing campaign plans by providing a simple brief. Let AI handle the strategy so you can focus on execution.</p>
    <a href="#" style="background-color: #a855f7; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Try it Now</a>
  </div>
</div>
`;

const announcementContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #0a0a1a; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #141428; border: 1px solid #f97316; border-radius: 8px; padding: 20px;">
    <h2 style="color: #f97316;">Major Update: CRM Module is Live!</h2>
    <p>We are excited to announce the official launch of our brand new CRM module. Manage your contacts, deals, and sales pipeline all in one place.</p>
    <p>This powerful new addition is designed to streamline your workflow and give you a complete picture of your customer relationships.</p>
  </div>
</div>
`;

const passwordResetContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #0a0a1a; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #141428; border: 1px solid #ccc; border-radius: 8px; padding: 20px;">
    <h2 style="color: #ffffff;">Password Reset Request</h2>
    <p>We received a request to reset your password. If you did not make this request, you can safely ignore this email.</p>
    <p>To reset your password, click the link below:</p>
    <a href="#" style="background-color: #555; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p style="font-size: 12px; color: #888; margin-top: 20px;">This link will expire in 1 hour.</p>
  </div>
</div>
`;

// --- Dummy Data (Realistic Templates) ---
const myTemplatesData: EmailTemplate[] = [
  { id: 'mytpl1', name: 'Personal Project Update', category: 'Project Management', thumbnailUrl: 'https://picsum.photos/seed/tpl1/400/300', content: '<p>Project update content here...</p>' },
  { id: 'mytpl2', name: 'Meeting Follow-Up', category: 'Communication', thumbnailUrl: 'https://picsum.photos/seed/tpl2/400/300', content: '<p>Meeting follow-up content...</p>' },
];

const teamTemplatesData: EmailTemplate[] = [
  { id: 'teamtpl1', name: 'Welcome New User', category: 'Onboarding', thumbnailUrl: 'https://picsum.photos/seed/tpl3/400/300', content: welcomeEmailContent, isTeam: true },
  { id: 'teamtpl2', name: 'Weekly Newsletter', category: 'Marketing', thumbnailUrl: 'https://picsum.photos/seed/tpl4/400/300', content: newsletterContent, isTeam: true },
  { id: 'teamtpl3', name: 'Product Announcement', category: 'Marketing', thumbnailUrl: 'https://picsum.photos/seed/tpl5/400/300', content: announcementContent, isTeam: true },
  { id: 'teamtpl4', name: 'Password Reset', category: 'Transactional', thumbnailUrl: 'https://picsum.photos/seed/tpl6/400/300', content: passwordResetContent, isTeam: true },
];

// --- Components ---

const TemplateCard: React.FC<{ template: EmailTemplate, onUse: () => void, onEdit: () => void }> = ({ template, onUse, onEdit }) => (
    <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-cyber-cyan/50 hover:shadow-glow-cyan">
        <div className="aspect-[4/3] bg-black/20 overflow-hidden relative">
            <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
                <button onClick={onUse} className="px-4 py-2 bg-cyber-cyan text-black font-bold rounded-lg text-sm">Use</button>
                <button onClick={onEdit} className="px-4 py-2 bg-cyber-surface text-white font-bold rounded-lg text-sm">Edit</button>
            </div>
        </div>
        <div className="p-3">
            <h4 className="font-bold text-white truncate">{template.name}</h4>
            <p className="text-xs text-gray-400">{template.category}</p>
        </div>
    </GlassCard>
);

const TemplatesView: React.FC<{ title: string, templates: EmailTemplate[], onAddNew: () => void, onEdit: (template: EmailTemplate) => void }> = ({ title, templates, onAddNew, onEdit }) => (
    <div className="h-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">Browse, use, and manage your email templates.</p>
            </div>
            <button onClick={onAddNew} className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow">
                <PlusIcon className="w-5 h-5"/> Create Template
            </button>
        </div>
        <div className="relative w-full max-w-xs">
            <input type="text" placeholder="Search templates..." className="w-full bg-black/30 border border-cyber-border rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-purple" />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
            {templates.map(tpl => <TemplateCard key={tpl.id} template={tpl} onUse={() => {}} onEdit={() => onEdit(tpl)} />)}
        </div>
    </div>
);

const AnalyticsView: React.FC = () => (
    <div className="h-full flex flex-col gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Template Analytics</h2>
            <p className="text-gray-400">Track the performance and usage of your templates.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <AIChartCard
                title="Template Open Rates"
                prompt="Create a bar chart for email template open rates: Welcome Email (65%), Newsletter (42%), Product Update (38%), Password Reset (92%)."
            />
            <AIChartCard
                title="Template Usage by Category"
                prompt="Create a pie chart showing template usage by category: Marketing (45%), Onboarding (25%), Transactional (20%), Communication (10%)."
            />
        </div>
    </div>
);

const TemplateEditorModal: React.FC<{ template: Partial<EmailTemplate> | null, onClose: () => void, onSave: (template: any) => void }> = ({ template, onClose, onSave }) => {
    const [name, setName] = useState(template?.name || 'New Template');
    const [category, setCategory] = useState(template?.category || 'General');
    const [content, setContent] = useState(template?.content || '<p>Start writing your HTML email here.</p>');

    const handleSave = () => {
        onSave({ 
            id: template?.id || `tpl-${Date.now()}`, 
            name, 
            category, 
            content, 
            thumbnailUrl: template?.thumbnailUrl || 'https://picsum.photos/seed/newtpl/400/300',
            isTeam: template?.isTeam
        });
        onClose();
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-cyber-border">
                    <h2 className="text-xl font-bold text-white">{template?.id ? 'Edit Template' : 'Create New Template'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white" />
                        <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white" />
                    </div>
                    <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full flex-1 bg-black/30 border border-cyber-border rounded-lg p-3 text-white resize-none font-mono focus:outline-none focus:ring-1 focus:ring-cyber-purple"></textarea>
                </div>
                <footer className="p-4 border-t border-cyber-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan">Save Template</button>
                </footer>
            </GlassCard>
        </div>
    );
};

const Templates: React.FC = () => {
    const [activeSection, setActiveSection] = useState<TemplatesSection>('My Templates');
    const [allMyTemplates, setAllMyTemplates] = useState(myTemplatesData);
    const [allTeamTemplates, setAllTeamTemplates] = useState(teamTemplatesData);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);

    const handleAddNew = () => {
        setEditingTemplate({ isTeam: activeSection === 'Team Templates' });
        setIsEditorOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSaveTemplate = (template: EmailTemplate) => {
        if(template.isTeam) {
            setAllTeamTemplates(prev => {
                const index = prev.findIndex(t => t.id === template.id);
                if (index > -1) {
                    const newTemplates = [...prev];
                    newTemplates[index] = template;
                    return newTemplates;
                }
                return [...prev, template];
            });
        } else {
             setAllMyTemplates(prev => {
                const index = prev.findIndex(t => t.id === template.id);
                if (index > -1) {
                    const newTemplates = [...prev];
                    newTemplates[index] = template;
                    return newTemplates;
                }
                return [...prev, template];
            });
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'My Templates':
                return <TemplatesView title="My Templates" templates={allMyTemplates} onAddNew={handleAddNew} onEdit={handleEdit} />;
            case 'Team Templates':
                return <TemplatesView title="Team Templates" templates={allTeamTemplates} onAddNew={handleAddNew} onEdit={handleEdit} />;
            case 'Analytics':
                return <AnalyticsView />;
            default:
                return <TemplatesView title="My Templates" templates={allMyTemplates} onAddNew={handleAddNew} onEdit={handleEdit} />;
        }
    };

    return (
        <div className="flex h-full">
            <TemplatesL2Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
            {isEditorOpen && <TemplateEditorModal template={editingTemplate} onClose={() => setIsEditorOpen(false)} onSave={handleSaveTemplate} />}
        </div>
    );
};

export default Templates;
