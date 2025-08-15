
import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { ChevronLeftIcon } from '../../../../components/icons/InterfaceIcons';

const ChevronRightIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Simple function to get days in a month (for demo purposes)
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const events = {
    '2024-07-08': [{ title: 'Team Sync', color: 'bg-cyber-purple' }],
    '2024-07-15': [{ title: 'Project Deadline', color: 'bg-cyber-orange' }],
    '2024-07-22': [{ title: 'Q3 Review', color: 'bg-cyber-cyan' }, { title: 'Product Demo', color: 'bg-green-500' }],
    '2024-08-01': [{ title: 'New Sprint', color: 'bg-blue-500' }],
};

const MyCalendar: React.FC = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    
    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">My Calendar</h2>
            <GlassCard className="p-4 flex-1 flex flex-col">
                <header className="flex items-center justify-between mb-4">
                    <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <h3 className="text-xl font-bold text-white">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-white/10"><ChevronRightIcon className="w-6 h-6" /></button>
                </header>
                <div className="grid grid-cols-7 text-center font-semibold text-gray-400 text-sm border-b border-cyber-border">
                    {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 flex-1">
                    {calendarDays.map((day, index) => {
                        const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                        const dayEvents = events[dateStr as keyof typeof events] || [];
                        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                        return (
                            <div key={index} className={`border-r border-b border-cyber-border/50 p-2 ${!day ? 'bg-black/10' : 'hover:bg-cyber-surface/50'}`}>
                                <span className={`font-semibold ${isToday ? 'bg-cyber-cyan text-black rounded-full h-7 w-7 inline-flex items-center justify-center' : 'text-white'}`}>
                                    {day}
                                </span>
                                <div className="mt-2 space-y-1">
                                     {dayEvents.map(event => (
                                         <div key={event.title} className={`p-1 rounded-md text-xs text-white truncate ${event.color}`} title={event.title}>
                                             {event.title}
                                         </div>
                                     ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </GlassCard>
        </div>
    );
};

export default MyCalendar;
