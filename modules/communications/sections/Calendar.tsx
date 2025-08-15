
import React, { useState } from 'react';
import CalendarL2Sidebar from '../components/CalendarL2Sidebar';
import { CalendarSection } from '../types';
import Placeholder from '../../../components/Placeholder';
import MyCalendar from './calendar/MyCalendar';

const Calendar: React.FC = () => {
    const [activeSection, setActiveSection] = useState<CalendarSection>('My Calendar');

    const renderSection = () => {
        switch (activeSection) {
            case 'My Calendar':
                return <MyCalendar />;
            case 'Team Schedule':
            case 'Bookings':
                return <Placeholder sectionName={activeSection} />;
            default:
                return <MyCalendar />;
        }
    };

    return (
        <div className="flex h-full">
            <CalendarL2Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto h-full">
                {renderSection()}
            </main>
        </div>
    );
};

export default Calendar;
