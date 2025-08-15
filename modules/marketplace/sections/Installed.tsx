

import React from 'react';
import GlassCard from '../../../components/GlassCard';

const installedApps = [
    { name: "Advanced Charting", publisher: "DataViz Inc.", category: "Analytics", img: "https://picsum.photos/seed/chart/400/200", version: "2.1.0" },
    { name: "Security Sentinel", publisher: "CyberGuard", category: "Security", img: "https://picsum.photos/seed/security/400/200", version: "1.5.3" },
    { name: "Team Collaboration Suite", publisher: "SyncUp", category: "Productivity", img: "https://picsum.photos/seed/team/400/200", version: "3.0.1" },
];

const Installed: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-2">
        <div>
            <h2 className="text-3xl font-bold text-white">Installed Apps</h2>
            <p className="text-gray-400">Manage your currently installed applications.</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto pr-2">
            {installedApps.map((app, i) => (
                <GlassCard key={i} className="flex flex-col overflow-hidden group transition-all hover:border-cyber-purple hover:shadow-glow-purple">
                    <img src={app.img} alt={app.name} className="w-full h-32 object-cover" />
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-white">{app.name}</h3>
                        <p className="text-sm text-gray-400">v{app.version} by {app.publisher}</p>
                        <div className="flex-1"></div>
                        <div className="flex justify-between items-center mt-4 gap-2">
                            <button className="flex-1 text-center font-bold text-cyber-cyan px-4 py-2 rounded-lg border border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-colors">
                                Configure
                            </button>
                             <button className="flex-1 text-center font-bold text-red-400 px-4 py-2 rounded-lg border border-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors">
                                Uninstall
                            </button>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    </div>
  );
};

export default Installed;
