
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const scheduleData = [
    { time: '09:00 - 10:30', courseCode: 'CS101', courseName: 'Intro to AI', location: 'Eng. Building, Room 203', color: 'border-cyber-cyan' },
    { time: '11:00 - 12:30', courseCode: 'CS202', courseName: 'Data Structures', location: 'CS Building, Hall A', color: 'border-green-400' },
    { time: '14:00 - 15:30', courseCode: 'PHY101', courseName: 'Quantum Mechanics', location: 'Science Wing, Lab 3', color: 'border-cyber-purple' },
];

const ScheduleCard: React.FC = () => {
    return (
        <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
            <div className="space-y-4">
                {scheduleData.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="text-right flex-shrink-0 w-20">
                            <p className="font-semibold text-gray-300 font-mono">{item.time.split(' - ')[0]}</p>
                            <p className="text-xs text-gray-500 font-mono">{item.time.split(' - ')[1]}</p>
                        </div>
                        <div className={`flex-1 pl-4 border-l-2 ${item.color}`}>
                            <p className="font-bold text-white">{item.courseCode} - {item.courseName}</p>
                            <p className="text-sm text-gray-400">{item.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export default ScheduleCard;
