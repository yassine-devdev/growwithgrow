
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const callHistory = [
    { id: 1, topic: "Q3 Project Sync", participants: 4, date: "2024-07-22 10:00 AM", duration: "45 min" },
    { id: 2, topic: "1-on-1 with Anya", participants: 2, date: "2024-07-21 15:30 PM", duration: "28 min" },
    { id: 3, topic: "Marketing Brainstorm", participants: 6, date: "2024-07-20 09:00 AM", duration: "1 hr 15 min" },
    { id: 4, topic: "Quick Follow-up", participants: 2, date: "2024-07-19 11:00 AM", duration: "12 min" },
];

const HistoryView: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Call History</h2>
            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                            <tr>
                                {['Topic', 'Participants', 'Date', 'Duration', ''].map(h => (
                                    <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {callHistory.map(call => (
                                <tr key={call.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-white">{call.topic}</td>
                                    <td className="p-3 text-gray-400">{call.participants}</td>
                                    <td className="p-3 text-gray-400">{call.date}</td>
                                    <td className="p-3 text-gray-400">{call.duration}</td>
                                    <td className="p-3 text-right"><button className="font-medium text-cyber-cyan hover:underline">Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default HistoryView;
