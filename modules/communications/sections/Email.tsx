
import React, { useState } from 'react';
import EmailL2Sidebar from '../components/EmailL2Sidebar';
import { EmailSection, InnovationSection } from '../types';
import Placeholder from '../../../components/Placeholder';
import GlassCard from '../../../components/GlassCard';
import SmartTriageView from './email/SmartTriageView';

type ActiveEmailSection = EmailSection | InnovationSection;

interface EmailData {
    id: number;
    from: string;
    fromEmail: string;
    subject: string;
    body: string;
    read: boolean;
    date: string;
    tag?: { text: string; color: string; };
}

const dummyEmails: Record<EmailSection, EmailData[]> = {
    Inbox: [
        { id: 1, from: 'System Admin', fromEmail: 'admin@system.io', subject: 'Project Update: Q3 Milestones', body: 'Team,\n\nPlease find the attached report for Q3 milestone progress. We are on track to meet our targets. Let\'s keep up the great work.\n\nBest,\nAdmin', read: false, date: '10:30 AM', tag: { text: 'Urgent', color: 'red' } },
        { id: 2, from: 'HR Department', fromEmail: 'hr@system.io', subject: 'Upcoming Holiday Schedule', body: 'A reminder that the office will be closed next Monday for the public holiday.', read: true, date: 'Yesterday', tag: { text: 'Info', color: 'blue' } },
        { id: 3, from: 'IT Support', fromEmail: 'support@system.io', subject: 'Scheduled Maintenance Notification', body: 'System maintenance is scheduled for this Sunday at 2 AM UTC.', read: true, date: '2 days ago' },
    ],
    Sent: [
        { id: 4, from: 'Me', fromEmail: 'me@system.io', subject: 'Re: Project Update: Q3 Milestones', body: 'Thanks for the update, Admin. The report looks great!', read: true, date: '11:15 AM' },
    ],
    Drafts: [
        { id: 5, from: 'Me', fromEmail: 'me@system.io', subject: 'Draft: Marketing Campaign Ideas', body: 'Here are a few ideas for the upcoming campaign...', read: true, date: 'Yesterday' },
    ],
    Spam: [],
    Archive: [],
};


const ComposeView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="h-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">New Message</h2>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">&larr; Back to Inbox</button>
        </div>
        <GlassCard className="p-4 flex-1 flex flex-col gap-3">
            <input type="text" placeholder="To:" className="w-full bg-black/30 border-b border-cyber-border p-2 focus:outline-none focus:border-cyber-purple text-white" />
            <input type="text" placeholder="Subject:" className="w-full bg-black/30 border-b border-cyber-border p-2 focus:outline-none focus:border-cyber-purple text-white" />
            <textarea placeholder="Your message..." className="w-full flex-1 bg-black/30 border border-cyber-border rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-1 focus:ring-cyber-purple"></textarea>
            <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700">Save Draft</button>
                <button className="px-5 py-2 rounded-lg bg-cyber-cyan text-black font-bold hover:shadow-glow-cyan">Send</button>
            </div>
        </GlassCard>
    </div>
);


const Email: React.FC = () => {
    const [activeSection, setActiveSection] = useState<ActiveEmailSection>('Inbox');
    const [selectedEmailId, setSelectedEmailId] = useState<number | null>(1);
    const [isComposing, setIsComposing] = useState(false);

    const emails = dummyEmails[activeSection as EmailSection] || [];
    const selectedEmail = emails.find(e => e.id === selectedEmailId);

    const handleCompose = () => {
        setSelectedEmailId(null);
        setIsComposing(true);
    };

    const handleSelectEmail = (id: number) => {
        setIsComposing(false);
        setSelectedEmailId(id);
    };
    
    const handleBackToList = () => {
        setIsComposing(false);
        setSelectedEmailId(emails.length > 0 ? emails[0].id : null);
    }
    
    const renderContent = () => {
        if (isComposing) {
            return <ComposeView onBack={handleBackToList} />;
        }
        
        if (activeSection === 'Smart Triage (AI)') {
            return <SmartTriageView />;
        }
        
        const isPlaceholderSection = !['Inbox', 'Sent', 'Drafts'].includes(activeSection);
        if (isPlaceholderSection) {
            return <Placeholder sectionName={activeSection} />;
        }

        return (
            <div className="h-full flex gap-2">
                <GlassCard className="w-full md:w-1/3 p-2 flex flex-col">
                    <h2 className="text-xl font-bold text-cyber-cyan mb-2 p-2">{activeSection} ({emails.length})</h2>
                    <ul className="space-y-1 overflow-y-auto pr-1">
                        {emails.map((email) => (
                            <li key={email.id} onClick={() => handleSelectEmail(email.id)} className={`p-3 cursor-pointer rounded-md transition-colors ${selectedEmailId === email.id ? 'bg-cyber-purple/20' : 'hover:bg-white/10'} ${!email.read ? 'border-l-4 border-cyber-cyan' : ''}`}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-semibold truncate ${!email.read ? 'text-white' : 'text-gray-300'}`}>{email.from}</h3>
                                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{email.date}</p>
                                </div>
                                <p className={`text-sm truncate ${!email.read ? 'text-gray-300' : 'text-gray-400'}`}>{email.subject}</p>
                            </li>
                        ))}
                    </ul>
                </GlassCard>
                 <GlassCard className="hidden md:flex md:w-2/3 p-6 flex-col">
                    {selectedEmail ? (
                        <>
                           <header className="border-b border-cyber-border pb-3 mb-4">
                               <h2 className="text-2xl font-bold text-white">{selectedEmail.subject}</h2>
                               <p className="text-sm text-gray-400">From: {selectedEmail.from} &lt;{selectedEmail.fromEmail}&gt;</p>
                           </header>
                            <div className="flex-1 overflow-y-auto text-gray-300 space-y-4 whitespace-pre-wrap">
                                {selectedEmail.body}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Select an email to read</div>
                    )}
                 </GlassCard>
            </div>
        )
    };

    return (
        <div className="flex h-full">
            <EmailL2Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onCompose={handleCompose} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default Email;
