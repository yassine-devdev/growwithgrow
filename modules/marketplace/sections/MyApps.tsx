
import React from 'react';
import GlassCard from '../../../components/GlassCard';

const myApps = [
    { name: "My Custom Analytics", installs: 1250, revenue: 450.75, status: "Published", img: "https://picsum.photos/seed/myapp1/400/200" },
    { name: "Internal Team Dashboard", installs: 88, revenue: 0, status: "Private", img: "https://picsum.photos/seed/myapp2/400/200" },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isPublished = status === 'Published';
    return <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPublished ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>{status}</span>;
}

const MyApps: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-2">
        <div>
            <h2 className="text-3xl font-bold text-white">My Developer Apps</h2>
            <p className="text-gray-400">Manage and track the performance of your published applications.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto pr-2">
            {myApps.map((app, i) => (
                <GlassCard key={i} className="flex flex-col overflow-hidden group">
                    <img src={app.img} alt={app.name} className="w-full h-32 object-cover" />
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                           <h3 className="text-xl font-bold text-white">{app.name}</h3>
                           <StatusBadge status={app.status}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">{app.installs.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 uppercase">Installs</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-white">${app.revenue.toFixed(2)}</p>
                                <p className="text-xs text-gray-400 uppercase">Revenue</p>
                            </div>
                        </div>
                        <div className="flex-1"></div>
                        <button className="mt-4 w-full text-center font-bold text-cyber-cyan px-4 py-2 rounded-lg border border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-colors">
                            Manage
                        </button>
                    </div>
                </GlassCard>
            ))}
             <GlassCard className="flex flex-col items-center justify-center border-dashed border-2 border-cyber-border hover:border-cyber-cyan hover:text-cyber-cyan transition-colors text-gray-500 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 font-bold">Create New App</p>
            </GlassCard>
        </div>
    </div>
  );
};

export default MyApps;
