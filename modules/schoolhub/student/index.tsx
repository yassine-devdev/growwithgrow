
import React, { useState } from 'react';
import StudentL2Sidebar from './components/StudentL2Sidebar';
import ProfileCard from './components/ProfileCard';
import ScheduleCard from './components/ScheduleCard';
import GradesCard from './components/GradesCard';

const StudentView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('ai-guide');

    const navItems = [
      { id: 'ai-guide', label: 'AI Learning Guide' },
      { id: 'pathways', label: 'Learning Pathways' },
      { id: 'analyzer', label: 'Learning Style Analyzer' },
      { id: 'gamified-map', label: 'Gamified Growth Map' },
      { id: 'educoins', label: 'School Token Economy' },
      { id: 'goal-trees', label: 'Goal Trees' },
      { id: 'calendar-todo', label: 'Calendar & To-Do' },
      { id: 'journal', label: 'Personal Growth Journal' },
      { id: 'mood-check', label: 'Mood + Focus Check-In' },
      { id: 'mindfulness', label: 'Mindfulness Tools' },
      { id: 'playlist-generator', label: 'Study Playlist Generator' },
      { id: 'ai-mentor', label: 'AI Student Life Mentor' },
      { id: 'credentials', label: 'Skills Credentialing' },
      { id: 'portfolio', label: 'Universal Portfolio' },
      { id: 'ai-creative', label: 'AI Creative Assistant' },
      { id: 'news-feed', label: 'News & Opportunity Feed' },
      { id: 'citizenship', label: 'Digital Citizenship' },
      { id: 'world-classroom', label: 'World Classroom' },
      { id: 'communities', label: 'Peer-to-Peer Communities' },
      { id: 'global-hub', label: 'Global Learning Hub' },
      { id: 'ar-vr', label: 'Immersive AR/VR' },
      { id: 'impact-sim', label: 'Social Impact Simulator' },
      { id: 'project-market', label: 'Project Marketplace' },
      { id: 'chatbots', label: 'Language Chatbots' },
      { id: 'analytics', label: 'Growth Analytics' },
      { id: 'notifications', label: 'Emergency Notifications' },
      { id: 'study-assistant', label: 'AI Virtual Study Assistant' }
    ];

  return (
    <div className="flex h-full">
      <StudentL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
      <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto" style={{ height: '100%' }}>
        <h1 className="text-2xl font-bold text-white mb-6">{navItems.find(item => item.id === activeL2Item)?.label || 'Student Dashboard'}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <ProfileCard />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
                <ScheduleCard />
                <GradesCard />
            </div>
        </div>
      </main>
    </div>
  );
};

export default StudentView;
