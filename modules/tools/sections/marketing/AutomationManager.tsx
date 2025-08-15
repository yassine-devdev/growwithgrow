
import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { AutomationWorkflow, AudienceSuggestion } from '../../../../types';
import { PromptIcon, FacebookAdsIcon, GoogleAdsIcon, EmailIcon } from '../../components/Icons';
import * as SocialIcons from './SocialMediaIcons';
import { generateAudienceSuggestions, generateText } from '../../../../services/geminiService';

type AutomationStep = 'dashboard' | 'templates' | 'create';
type TemplateType = 'Facebook Ad' | 'Google Ads' | 'Email Sequence';

const initialWorkflows: AutomationWorkflow[] = [
    { id: '1', name: 'Summer Sale Facebook Campaign', type: 'Facebook Ad', status: 'Active', performance: { reach: 12500, conversions: 234, cost: 450.50 } },
    { id: '2', name: 'New User Welcome Emails', type: 'Email Sequence', status: 'Active', performance: { reach: 1800, conversions: 450, cost: 0 } },
    { id: '3', name: 'Q4 Google Retargeting', type: 'Google Ads', status: 'Paused', performance: { reach: 35000, conversions: 412, cost: 890.00 } },
    { id: '4', name: 'Holiday Promotion Draft', type: 'Facebook Ad', status: 'Draft', performance: { reach: 0, conversions: 0, cost: 0 } },
];

const StatusBadge: React.FC<{ status: AutomationWorkflow['status'] }> = ({ status }) => {
    const statusClasses = {
        Active: 'bg-green-500/30 text-green-300',
        Paused: 'bg-yellow-500/30 text-yellow-300',
        Draft: 'bg-gray-500/30 text-gray-400',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

const AutomationDashboard: React.FC<{ workflows: AutomationWorkflow[], onSelectTemplate: (type: TemplateType) => void }> = ({ workflows, onSelectTemplate }) => (
    <div className="h-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white">Advanced Automations</h2>
                <p className="text-gray-400">Manage your multi-platform campaigns and workflows.</p>
            </div>
            <button onClick={() => onSelectTemplate('Facebook Ad')} className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow">
                Create Automation
            </button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto pr-2">
            {workflows.map(wf => (
                <GlassCard key={wf.id} className="p-4 flex flex-col transition-all hover:border-cyber-cyan/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-white">{wf.name}</p>
                            <p className="text-sm text-cyber-cyan font-semibold">{wf.type}</p>
                        </div>
                        <StatusBadge status={wf.status} />
                    </div>
                    <div className="flex-1"></div>
                    <div className="grid grid-cols-3 gap-4 text-center mt-4 pt-4 border-t border-cyber-border">
                        <div>
                            <p className="text-2xl font-bold text-white">{wf.performance.reach.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 uppercase">Reach</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{wf.performance.conversions}</p>
                            <p className="text-xs text-gray-400 uppercase">Conversions</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">${wf.performance.cost.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 uppercase">Cost</p>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    </div>
);

const TemplateSelector: React.FC<{ onSelect: (type: TemplateType) => void }> = ({ onSelect }) => {
    const templates = [
        { type: 'Facebook Ad', icon: FacebookAdsIcon, description: 'Launch a targeted ad campaign on Facebook & Instagram.' },
        { type: 'Google Ads', icon: GoogleAdsIcon, description: 'Run retargeting and search campaigns on Google.' },
        { type: 'Email Sequence', icon: EmailIcon, description: 'Create an automated series of emails for leads.' },
    ] as const;
    return (
        <div className="h-full flex flex-col items-center justify-center gap-2">
            <h2 className="text-3xl font-bold text-white">Choose a template for your advanced workflow</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {templates.map(t => (
                    <GlassCard key={t.type} onClick={() => onSelect(t.type)} className="p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-cyber-purple hover:shadow-glow-purple transition-all duration-300">
                        <t.icon className="w-12 h-12 mb-4" />
                        <h3 className="text-xl font-bold text-white">{t.type}</h3>
                        <p className="text-gray-400 mt-2">{t.description}</p>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

const CreationForm: React.FC<{ templateType: TemplateType, onBack: () => void }> = ({ templateType, onBack }) => {
    const [audiencePrompt, setAudiencePrompt] = useState('Tech-savvy young professionals in urban areas interested in sci-fi and retro gaming.');
    const [adCopyPrompt, setAdCopyPrompt] = useState('A new cyberpunk-themed jacket with LED lights.');
    const [audienceSuggestions, setAudienceSuggestions] = useState<AudienceSuggestion | null>(null);
    const [adCopy, setAdCopy] = useState('');
    const [isLoading, setIsLoading] = useState({ audience: false, copy: false });

    const handleGenerateAudience = async () => {
        setIsLoading(p => ({ ...p, audience: true }));
        setAudienceSuggestions(null);
        try {
            const result = await generateAudienceSuggestions(audiencePrompt);
            setAudienceSuggestions(result);
        } catch (e) { console.error(e) } finally {
            setIsLoading(p => ({ ...p, audience: false }));
        }
    }
    
    const handleGenerateCopy = async () => {
        setIsLoading(p => ({ ...p, copy: true }));
        setAdCopy('');
        try {
             const prompt = `Write 2-3 short, punchy ad copy variations for a social media campaign. The product is: "${adCopyPrompt}". Include a headline and body text for each.`;
            const result = await generateText(prompt);
            setAdCopy(result);
        } catch (e) { console.error(e) } finally {
            setIsLoading(p => ({ ...p, copy: false }));
        }
    }


    return (
        <div className="h-full flex flex-col gap-2">
             <div className="flex justify-between items-center">
                <div>
                    <button onClick={onBack} className="text-sm text-cyber-cyan hover:underline mb-2">&larr; Back to templates</button>
                    <h2 className="text-3xl font-bold text-white">Create {templateType} Automation</h2>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
                <GlassCard className="p-4 flex flex-col gap-4 overflow-y-auto">
                     <div>
                        <label className="text-lg font-semibold text-cyber-cyan flex items-center gap-2 mb-2"><PromptIcon className="w-5 h-5" /> AI Audience Suggester</label>
                        <textarea value={audiencePrompt} onChange={e => setAudiencePrompt(e.target.value)} rows={3} className="w-full bg-black/30 border border-cyber-border rounded-lg p-2 text-white text-sm" />
                        <button onClick={handleGenerateAudience} disabled={isLoading.audience} className="mt-2 w-full py-2 bg-cyber-orange text-white text-sm font-bold rounded-lg hover:shadow-glow-orange disabled:bg-gray-600">{isLoading.audience ? 'Generating...' : 'Suggest Audience'}</button>
                    </div>
                     <div>
                        <label className="text-lg font-semibold text-cyber-cyan flex items-center gap-2 mb-2"><PromptIcon className="w-5 h-5" /> AI Ad Copywriter</label>
                        <textarea value={adCopyPrompt} onChange={e => setAdCopyPrompt(e.target.value)} rows={2} className="w-full bg-black/30 border border-cyber-border rounded-lg p-2 text-white text-sm" />
                        <button onClick={handleGenerateCopy} disabled={isLoading.copy} className="mt-2 w-full py-2 bg-cyber-orange text-white text-sm font-bold rounded-lg hover:shadow-glow-orange disabled:bg-gray-600">{isLoading.copy ? 'Generating...' : 'Generate Ad Copy'}</button>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Audience Suggestions</h3>
                        {audienceSuggestions ? (
                            <div className="text-sm space-y-2 mt-2">
                                <p><strong className="text-gray-300">Demographics:</strong> {audienceSuggestions.demographics.join(', ')}</p>
                                <p><strong className="text-gray-300">Interests:</strong> {audienceSuggestions.interests.join(', ')}</p>
                                <p><strong className="text-gray-300">Behaviors:</strong> {audienceSuggestions.behaviors.join(', ')}</p>
                            </div>
                        ) : (<div className="text-sm text-gray-500 mt-2">Generate an audience to see suggestions here.</div>)}
                    </div>
                     <div className="border-t border-cyber-border pt-4">
                        <h3 className="text-lg font-semibold text-white">Generated Ad Copy</h3>
                        {adCopy ? (
                             <pre className="text-sm whitespace-pre-wrap font-sans bg-black/20 p-2 rounded mt-2">{adCopy}</pre>
                        ) : (<div className="text-sm text-gray-500 mt-2">Generate ad copy to see suggestions here.</div>)}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

const AdvancedAutomationWorkflow: React.FC = () => {
    const [step, setStep] = useState<AutomationStep>('dashboard');
    const [workflows, setWorkflows] = useState(initialWorkflows);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('Facebook Ad');

    const handleSelectTemplate = (type: TemplateType) => {
        setSelectedTemplate(type);
        setStep('create');
    };

    const handleBack = () => {
        setStep('templates');
    }

    switch (step) {
        case 'dashboard':
            return <AutomationDashboard workflows={workflows} onSelectTemplate={() => setStep('templates')} />;
        case 'templates':
            return <TemplateSelector onSelect={handleSelectTemplate} />;
        case 'create':
            return <CreationForm templateType={selectedTemplate} onBack={handleBack} />;
        default:
            return <AutomationDashboard workflows={workflows} onSelectTemplate={() => setStep('templates')} />;
    }
};

const PlatformIdeaGenerator: React.FC<{ platformName: string }> = ({ platformName }) => {
    const [prompt, setPrompt] = useState('Promote a new line of futuristic sneakers.');
    const [ideas, setIdeas] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setIdeas('');
        try {
            const fullPrompt = `As a marketing expert, generate 3 creative and actionable marketing automation ideas for ${platformName}. The goal is: '${prompt}'. Focus on platform-specific features and create a clear, concise list.`;
            const result = await generateText(fullPrompt);
            setIdeas(result);
        } catch (error) {
            console.error(error);
            setIdeas('Failed to generate ideas. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col lg:flex-row gap-2">
            <GlassCard className="lg:w-1/3 p-6 flex flex-col">
                 <h3 className="text-xl font-bold text-white mb-2">Automation Ideas for {platformName}</h3>
                 <p className="text-gray-400 mb-4 text-sm">Describe your marketing goal, and let AI suggest platform-specific automation strategies.</p>
                 <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full flex-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white text-sm resize-none"/>
                 <button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full py-3 bg-cyber-purple text-white text-sm font-bold rounded-lg hover:shadow-glow-purple disabled:bg-gray-600">
                    {isLoading ? 'Generating...' : 'Generate Ideas'}
                 </button>
            </GlassCard>
            <GlassCard className="lg:w-2/3 p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-white mb-4">Generated Ideas</h3>
                 <div className="bg-black/40 rounded-lg p-4 h-full flex-1 overflow-y-auto font-mono text-gray-300 whitespace-pre-wrap">
                    {isLoading ? <span className="animate-pulse">Generating...</span> : ideas || 'Your generated ideas will appear here.'}
                </div>
            </GlassCard>
        </div>
    );
};

const AutomationManager: React.FC = () => {
    const [activeSubNav, setActiveSubNav] = useState('Advanced Automation');

    const subNavItems = [
        { id: 'Advanced Automation', label: 'Advanced', icon: PromptIcon },
        { id: 'Facebook', icon: SocialIcons.FacebookIcon },
        { id: 'Instagram', icon: SocialIcons.InstagramIcon },
        { id: 'TikTok', icon: SocialIcons.TikTokIcon },
        { id: 'LinkedIn', icon: SocialIcons.LinkedInIcon },
        { id: 'Pinterest', icon: SocialIcons.PinterestIcon },
        { id: 'Snapchat', icon: SocialIcons.SnapchatIcon },
    ];
    
    return (
        <div className="h-full flex flex-col gap-4">
            <GlassCard className="p-2 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                    {subNavItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveSubNav(item.id)}
                            title={item.label || item.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${activeSubNav === item.id ? 'bg-cyber-purple/20 text-cyber-purple' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label && <span className="hidden md:inline">{item.label}</span>}
                        </button>
                    ))}
                </div>
            </GlassCard>

            <div className="flex-1 min-h-0">
                {activeSubNav === 'Advanced Automation' ? (
                    <AdvancedAutomationWorkflow />
                ) : (
                    <PlatformIdeaGenerator platformName={activeSubNav} />
                )}
            </div>
        </div>
    )
};

export default AutomationManager;
