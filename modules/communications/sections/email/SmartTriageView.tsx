
import React, { useState, useEffect } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { LightbulbIcon } from '../../../schoolhub/student/components/Icons';

// Mock data similar to what's in Email.tsx
const allInboxEmails = [
    { id: 1, from: 'System Admin', subject: 'Project Update: Q3 Milestones', body: 'Team, please find the attached report...', date: '10:30 AM', category: 'Urgent & Important' },
    { id: 2, from: 'HR Department', subject: 'Upcoming Holiday Schedule', body: 'A reminder that the office will be closed...', date: 'Yesterday', category: 'Social & Other' },
    { id: 3, from: 'IT Support', subject: 'Scheduled Maintenance Notification', body: 'System maintenance is scheduled for this Sunday...', date: '2 days ago', category: 'Urgent & Important' },
    { id: 4, from: 'Design Weekly', subject: 'Top 10 UI Trends for 2025', body: 'Explore the future of design...', date: '3 days ago', category: 'Promotions & Newsletters' },
    { id: 5, from: 'GitHub', subject: '[notify] New comment on issue #4321', body: 'User @turing left a comment...', date: '4 days ago', category: 'Social & Other' },
    { id: 6, from: 'Marketing Team', subject: 'FWD: New Campaign Proposal', body: 'Please review the attached proposal...', date: '11:45 AM', category: 'Urgent & Important' },
    { id: 7, from: 'Cloud Services', subject: 'Your monthly invoice is ready', body: 'Your invoice for July is attached.', date: 'Yesterday', category: 'Promotions & Newsletters' },
];

const LoadingState = () => (
    <div className="flex flex-col justify-center items-center h-full text-cyber-cyan">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 font-semibold animate-pulse">AI is analyzing your inbox...</p>
    </div>
);

const EmailCard = ({ email, index }: { email: typeof allInboxEmails[0], index: number }) => (
    <div className="bg-cyber-surface/80 p-3 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
        <p className="font-bold text-white truncate">{email.subject}</p>
        <p className="text-sm text-gray-400 truncate">From: {email.from}</p>
        <p className="text-xs text-gray-500 text-right">{email.date}</p>
    </div>
);

const TriageColumn = ({ title, emails, colorClass }: { title: string, emails: typeof allInboxEmails, colorClass: string }) => (
    <div className="flex flex-col flex-1 min-w-0">
        <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 ${colorClass}`}>{title} ({emails.length})</h3>
        <div className="space-y-2 overflow-y-auto pr-2 flex-1">
            {emails.map((email, i) => <EmailCard key={email.id} email={email} index={i} />)}
        </div>
    </div>
);

const SmartTriageView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [triagedEmails, setTriagedEmails] = useState<{ urgent: any[], promotions: any[], social: any[] }>({
        urgent: [],
        promotions: [],
        social: []
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setTriagedEmails({
                urgent: allInboxEmails.filter(e => e.category === 'Urgent & Important'),
                promotions: allInboxEmails.filter(e => e.category === 'Promotions & Newsletters'),
                social: allInboxEmails.filter(e => e.category === 'Social & Other'),
            });
            setIsLoading(false);
        }, 1500); // Simulate AI processing time

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-full flex flex-col gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white">Smart Triage (AI)</h2>
                <p className="text-gray-400">Your inbox, automatically categorized by importance.</p>
            </div>

            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                {isLoading ? <LoadingState /> : (
                    <>
                        <GlassCard className="p-4 mb-4 flex items-center gap-3 border-l-4 border-cyber-cyan bg-cyber-cyan/10 flex-shrink-0">
                            <LightbulbIcon className="w-8 h-8 text-cyber-cyan"/>
                            <div>
                                <h4 className="font-bold text-white">AI Insight</h4>
                                <p className="text-sm text-gray-300">Triage complete. {triagedEmails.urgent.length} high-priority items identified for your review.</p>
                            </div>
                        </GlassCard>

                        <div className="flex-1 flex gap-4 overflow-hidden">
                            <TriageColumn title="Urgent & Important" emails={triagedEmails.urgent} colorClass="border-cyber-orange text-cyber-orange" />
                            <TriageColumn title="Promotions & Newsletters" emails={triagedEmails.promotions} colorClass="border-cyber-cyan text-cyber-cyan" />
                            <TriageColumn title="Social & Other" emails={triagedEmails.social} colorClass="border-cyber-purple text-cyber-purple" />
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    );
};

export default SmartTriageView;
