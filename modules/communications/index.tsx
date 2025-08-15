

import React from 'react';
import { CommunicationsSection } from './types';
import Email from './sections/Email';
import Templates from './sections/Templates';
import Calendar from './sections/Calendar';
import Announcements from './sections/Announcements';
import VideoCalls from './sections/VideoCalls';
import Blog from './sections/Blog';

interface CommunicationsProps {
    activeSection: CommunicationsSection;
}

const Communications: React.FC<CommunicationsProps> = ({ activeSection }) => {
    const renderSection = () => {
        switch (activeSection) {
            case 'Email':
                return <Email />;
            case 'Templates':
                return <Templates />;
            case 'Calendar':
                return <Calendar />;
            case 'Announcements':
                return <Announcements />;
            case 'Video Calls':
                return <VideoCalls />;
            case 'Blog':
                return <Blog />;
            default:
                return <Email />;
        }
    };

    return (
        <div className="h-full animate-fade-in -m-1 sm:-m-2 lg:-m-3">
            {renderSection()}
        </div>
    );
};

export default Communications;
