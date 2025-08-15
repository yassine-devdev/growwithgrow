
import React from 'react';
import GlassCard from '../../../components/GlassCard';

const models = [
    { name: "Core Reasoning Engine", version: "v2.5-flash", status: "Operational", type: "Language" },
    { name: "Image Generation Service", version: "v3.0-gen-002", status: "Operational", type: "Imaging" },
    { name: "Data Analysis Bot", version: "v1.8-pro", status: "Degraded Performance", type: "Analytics" },
    { name: "Code Completion Agent", version: "v4.1-beta", status: "Maintenance", type: "Development" },
    { name: "Search Grounding Layer", version: "v1.2", status: "Operational", type: "Search" },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-block";
    const colorClasses = {
        "Operational": "bg-green-500/20 text-green-400",
        "Degraded Performance": "bg-yellow-500/20 text-yellow-400",
        "Maintenance": "bg-blue-500/20 text-blue-400",
    }[status] || "bg-gray-500/20 text-gray-400";
    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


const ModelStatus: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Concierge AI Management</h2>
            <p className="text-gray-400 -mt-4">Monitor and manage the fleet of AI models integrated into the system.</p>

            <GlassCard className="p-2 flex-1 overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left">
                        <thead className="border-b border-cyber-border">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Model Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Version</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/50">
                            {models.map(model => (
                                <tr key={model.name} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{model.name}</td>
                                    <td className="p-4 text-gray-400">{model.type}</td>
                                    <td className="p-4 text-gray-400 font-mono">{model.version}</td>
                                    <td className="p-4">
                                        <StatusBadge status={model.status} />
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="font-medium text-cyber-cyan hover:underline">Configure</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default ModelStatus;
