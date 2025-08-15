import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { CampaignBrief, CampaignPlan } from '../../types';
import { generateCampaignPlan } from '../../../../services/geminiService';
import * as Icons from './CampaignPlannerIcons';

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
        <svg className="animate-spin h-10 w-10 text-cyber-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 font-semibold text-lg animate-pulse">Generating strategic campaign plan...</p>
        <p className="text-sm mt-2">This may take a moment as the AI crafts the perfect strategy.</p>
    </div>
);

const Section: React.FC<{ icon: React.FC<{className?: string}>, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="p-2 bg-cyber-surface rounded-lg mt-1"><Icon className="w-6 h-6 text-cyber-cyan"/></div>
        <div>
            <h4 className="text-lg font-bold text-white">{title}</h4>
            <div className="mt-1 text-gray-300 text-sm leading-relaxed">{children}</div>
        </div>
    </div>
);

const AICampaignPlanner: React.FC = () => {
    const [brief, setBrief] = useState<CampaignBrief>({
        productName: 'Cyber-optic Sunglasses',
        productDescription: 'Sunglasses with a built-in HUD that displays real-time data overlays. AR capabilities, stylish design, and long battery life.',
        campaignGoal: 'Drive pre-orders and build brand awareness for a new product launch.',
        targetAudience: 'Tech enthusiasts, early adopters, and fashion-forward individuals aged 20-35.',
        budget: '$20,000 for the first month'
    });
    const [plan, setPlan] = useState<CampaignPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBriefChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBrief({ ...brief, [e.target.name]: e.target.value });
    };

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await generateCampaignPlan(brief);
            setPlan(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate campaign plan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-2">
            <GlassCard className="lg:w-1/3 p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4">AI Campaign Planner</h2>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    <div>
                        <label className="text-sm font-semibold text-cyber-cyan">Product/Service Name</label>
                        <input type="text" name="productName" value={brief.productName} onChange={handleBriefChange} className="w-full mt-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-cyber-cyan">Description</label>
                        <textarea name="productDescription" value={brief.productDescription} onChange={handleBriefChange} rows={4} className="w-full mt-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white resize-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-cyber-cyan">Campaign Goal</label>
                        <input type="text" name="campaignGoal" value={brief.campaignGoal} onChange={handleBriefChange} className="w-full mt-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-cyber-cyan">Target Audience</label>
                        <textarea name="targetAudience" value={brief.targetAudience} onChange={handleBriefChange} rows={2} className="w-full mt-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white resize-none" />
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-cyber-cyan">Budget</label>
                        <input type="text" name="budget" value={brief.budget} onChange={handleBriefChange} className="w-full mt-1 bg-black/30 border border-cyber-border rounded-lg p-2 text-white" />
                    </div>
                </div>
                <button onClick={handleGeneratePlan} disabled={isLoading} className="w-full mt-4 py-3 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow disabled:bg-gray-600">
                    {isLoading ? 'Generating Plan...' : 'Generate Campaign Plan'}
                </button>
            </GlassCard>

            <GlassCard className="lg:w-2/3 p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-white mb-4 flex-shrink-0">Generated Campaign Plan</h3>
                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading && <LoadingState />}
                    {error && <div className="text-red-400 text-center">{error}</div>}
                    {plan && (
                        <div className="space-y-6">
                             <div className="text-center p-4 bg-cyber-surface rounded-lg">
                                <h2 className="text-3xl font-bold text-cyber-purple">{plan.campaignTitle}</h2>
                                <p className="text-xl italic text-gray-300 mt-1">"{plan.slogan}"</p>
                            </div>
                            <Section icon={Icons.TargetIcon} title="Target Persona:">
                                <p className="font-bold">{plan.targetPersona.name}</p>
                                <p>{plan.targetPersona.demographics}</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {plan.targetPersona.painPoints.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </Section>
                             <Section icon={Icons.MessageIcon} title="Core Messaging">
                                <ul className="list-disc list-inside space-y-1">
                                    {plan.coreMessaging.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                            </Section>
                            <Section icon={Icons.AngleIcon} title="Strategic Angles">
                                <ul className="list-disc list-inside space-y-1">
                                    {plan.strategicAngles.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            </Section>
                            <Section icon={Icons.ChannelIcon} title="Channel Strategy">
                                {plan.channelStrategy.map((s, i) => (
                                    <div key={i} className="p-3 bg-black/20 rounded-md mb-3">
                                        <p className="font-bold">{s.platform}: <span className="font-normal italic text-gray-400">{s.rationale}</span></p>
                                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-xs">
                                             {s.contentIdeas.map((idea, j) => <li key={j}>{idea}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </Section>
                             <Section icon={Icons.CopyIcon} title="Sample Ad Copy">
                                {plan.sampleAdCopy.map((c, i) => (
                                     <div key={i} className="p-3 bg-black/20 rounded-md mb-3">
                                         <p className="font-bold">Headline: {c.headline}</p>
                                         <p>Body: {c.body}</p>
                                     </div>
                                ))}
                            </Section>
                             <Section icon={Icons.KPIIcon} title="Key Performance Indicators (KPIs)">
                                <ul className="list-disc list-inside grid grid-cols-2 gap-x-4">
                                    {plan.kpis.map((k, i) => <li key={i}>{k}</li>)}
                                </ul>
                            </Section>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
export default AICampaignPlanner;
