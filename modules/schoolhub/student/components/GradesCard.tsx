
import React from 'react';
import GlassCard from '../../../../components/GlassCard';
import GPATrendChart from './GPATrendChart';

const gradesData = [
    { courseName: 'Intro to AI', grade: 'A-', progress: 92, color: 'bg-cyber-cyan' },
    { courseName: 'Data Structures', grade: 'B+', progress: 88, color: 'bg-green-400' },
    { courseName: 'Quantum Mechanics', grade: 'A', progress: 95, color: 'bg-cyber-purple' },
    { courseName: 'Ancient Civilizations', grade: 'In Progress', progress: 75, color: 'bg-cyber-orange' },
];

const ProgressBar: React.FC<{ progress: number, color: string }> = ({ progress, color }) => (
    <div className="w-full bg-black/30 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
    </div>
);

const GradesCard: React.FC = () => {
    return (
        <GlassCard className="p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Course Progress & GPA</h2>
            <div className="space-y-4">
                {gradesData.map((course, index) => (
                    <div key={index} >
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="font-semibold text-white">{course.courseName}</p>
                            <p className="font-mono text-lg font-bold text-gray-300">{course.grade}</p>
                        </div>
                        <ProgressBar progress={course.progress} color={course.color} />
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-4">
                <h3 className="text-lg font-semibold text-white mb-2">GPA Trend</h3>
                <GPATrendChart />
            </div>
        </GlassCard>
    );
};

export default GradesCard;
