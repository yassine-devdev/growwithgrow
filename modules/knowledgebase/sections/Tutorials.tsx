
import React from 'react';
import GlassCard from '../../../components/GlassCard';

const tutorials = [
    { title: "Mastering the AI Text Generator", duration: "5:42", category: "AI Suite", thumbnail: "https://picsum.photos/seed/tut1/400/225" },
    { title: "Creating Your First Dashboard", duration: "8:15", category: "Getting Started", thumbnail: "https://picsum.photos/seed/tut2/400/225" },
    { title: "A Guide to Marketplace Plugins", duration: "12:30", category: "Marketplace", thumbnail: "https://picsum.photos/seed/tut3/400/225" },
    { title: "Advanced API Usage", duration: "15:05", category: "Development", thumbnail: "https://picsum.photos/seed/tut4/400/225" },
    { title: "Securing Your Account", duration: "4:20", category: "Security", thumbnail: "https://picsum.photos/seed/tut5/400/225" },
    { title: "Collaborating with Team Chat", duration: "7:55", category: "Communications", thumbnail: "https://picsum.photos/seed/tut6/400/225" },
];

const PlayIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.535 0 3.284L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const Tutorials: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-2">
        <div>
            <h2 className="text-3xl font-bold text-white">Video Tutorials</h2>
            <p className="text-gray-400">Learn how to use the system with these guided videos.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto pr-2">
            {tutorials.map((tutorial, i) => (
                <GlassCard key={i} className="flex flex-col overflow-hidden group cursor-pointer transition-all hover:border-cyber-purple hover:shadow-glow-purple">
                    <div className="relative">
                        <img src={tutorial.thumbnail} alt={tutorial.title} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayIcon className="w-16 h-16 text-white/80" />
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">{tutorial.duration}</span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-white leading-tight">{tutorial.title}</h3>
                        <div className="flex-1"></div>
                        <div className="mt-3">
                             <span className="text-xs font-semibold uppercase px-2 py-1 bg-cyber-purple/20 text-cyber-purple rounded-full">{tutorial.category}</span>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    </div>
  );
};

export default Tutorials;
