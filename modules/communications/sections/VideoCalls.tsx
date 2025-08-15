
import React, { useState } from 'react';
import VideoCallsL2Sidebar from '../components/VideoCallsL2Sidebar';
import { VideoCallsSection } from '../types';
import NewCallView from './videocalls/NewCallView';
import ActiveCallView from './videocalls/ActiveCallView';
import HistoryView from './videocalls/HistoryView';
import RecordingsView from './videocalls/RecordingsView';

const VideoCalls: React.FC = () => {
    const [activeSection, setActiveSection] = useState<VideoCallsSection>('New Call');
    const [isCallActive, setIsCallActive] = useState(false);

    const handleStartCall = () => {
        setIsCallActive(true);
    };

    const handleEndCall = () => {
        setIsCallActive(false);
        setActiveSection('New Call');
    };

    const renderContent = () => {
        if (isCallActive) {
            return <ActiveCallView onEndCall={handleEndCall} />;
        }

        switch (activeSection) {
            case 'New Call':
                return <NewCallView onStartCall={handleStartCall} />;
            case 'History':
                return <HistoryView />;
            case 'Recordings':
                return <RecordingsView />;
            default:
                return <NewCallView onStartCall={handleStartCall} />;
        }
    };

    return (
        <div className="flex h-full">
            <VideoCallsL2Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default VideoCalls;
