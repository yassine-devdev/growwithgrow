
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import AnnouncementsL2Sidebar from '../components/AnnouncementsL2Sidebar';
import { AnnouncementsSection } from '../types';

const dummyAnnouncements = [
    { id: 1, title: "System Maintenance Scheduled for Sunday", author: "Admin Team", date: "2 days ago", status: "Published", content: "Please be advised that we will be performing scheduled maintenance on Sunday from 2:00 AM to 4:00 AM UTC. The system may be intermittently unavailable during this period." },
    { id: 2, title: "New Feature: AI Chart Generator", author: "Product Team", date: "5 days ago", status: "Published", content: "We're excited to announce the launch of the new AI Chart Generator in the Tools module! You can now create insightful visualizations by simply describing your data." },
    { id: 3, title: "Q3 Performance Review", author: "Admin Team", date: "1 week ago", status: "Published", content: "The Q3 performance report is now available in the Reports section of your Dashboard. Please review and provide any feedback by the end of the week." },
    { id: 4, title: "[DRAFT] New Security Policy Update", author: "Security Team", date: "1 day ago", status: "Draft", content: "A new security policy regarding two-factor authentication will be rolled out next month. More details to follow." },
];

const AnnouncementList: React.FC<{ title: string, announcements: typeof dummyAnnouncements }> = ({ title, announcements }) => (
     <div className="h-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">Latest updates and news from the system administrators.</p>
            </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {announcements.map(announcement => (
                <GlassCard key={announcement.id} className="p-6 transition-all hover:border-cyber-cyan/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{announcement.title}</h3>
                            <p className="text-sm text-gray-400">Posted by <span className="font-semibold text-cyber-purple">{announcement.author}</span> &bull; {announcement.date}</p>
                        </div>
                        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${announcement.status === 'Published' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-yellow-500/20 text-yellow-400'}`}>{announcement.status}</span>
                    </div>
                    <p className="text-gray-300 mt-4">{announcement.content}</p>
                </GlassCard>
            ))}
        </div>
    </div>
);


const Announcements: React.FC = () => {
    const [activeSection, setActiveSection] = useState<AnnouncementsSection>('All Announcements');

    const renderSection = () => {
        switch (activeSection) {
            case 'All Announcements':
                return <AnnouncementList title="All Announcements" announcements={dummyAnnouncements} />;
            case 'Drafts':
                return <AnnouncementList title="Drafts" announcements={dummyAnnouncements.filter(a => a.status === 'Draft')} />;
            case 'Published':
                return <AnnouncementList title="Published" announcements={dummyAnnouncements.filter(a => a.status === 'Published')} />;
            default:
                return <AnnouncementList title="All Announcements" announcements={dummyAnnouncements} />;
        }
    };

  return (
    <div className="flex h-full">
        <AnnouncementsL2Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
            {renderSection()}
        </main>
    </div>
  );
};

export default Announcements;
