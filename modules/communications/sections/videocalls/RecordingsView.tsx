
import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const recordings = [
    { id: 1, topic: "Q3 Project Sync", date: "2024-07-22", duration: "45:12", thumbnail: "https://picsum.photos/seed/rec1/400/225" },
    { id: 2, topic: "Marketing Brainstorm", date: "2024-07-20", duration: "01:15:34", thumbnail: "https://picsum.photos/seed/rec2/400/225" },
    { id: 3, topic: "Onboarding Session", date: "2024-07-18", duration: "58:40", thumbnail: "https://picsum.photos/seed/rec3/400/225" },
];

const PlayIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.535 0 3.284L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const RecordingsView: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Call Recordings</h2>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
                {recordings.map(rec => (
                    <GlassCard key={rec.id} className="flex flex-col overflow-hidden group cursor-pointer transition-all hover:border-cyber-purple hover:shadow-glow-purple">
                        <div className="relative">
                            <img src={rec.thumbnail} alt={rec.topic} className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayIcon className="w-16 h-16 text-white/80" />
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">{rec.duration}</span>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white truncate">{rec.topic}</h3>
                            <p className="text-sm text-gray-400">{rec.date}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default RecordingsView;
