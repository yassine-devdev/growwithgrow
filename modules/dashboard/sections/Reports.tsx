
import React from 'react';
import GlassCard from '../../../components/GlassCard';

const reports = [
    { name: "Q3 2024 - AI Usage Summary", date: "2024-07-15", format: "PDF", size: "2.5 MB" },
    { name: "Weekly User Activity Log", date: "2024-07-21", format: "CSV", size: "10.8 MB" },
    { name: "Monthly Performance Metrics", date: "2024-07-01", format: "PDF", size: "5.1 MB" },
];

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const Reports: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Report Center</h2>
            <p className="text-gray-400 -mt-4">Generate and download historical data reports.</p>
            
            <GlassCard className="p-6 flex-1 flex flex-col lg:flex-row gap-2">
                {/* Report Generation Form */}
                <div className="lg:w-1/3 space-y-4">
                    <h3 className="text-xl font-semibold text-cyber-cyan">Generate New Report</h3>
                     <div>
                        <label className="text-sm font-medium text-gray-300">Report Type</label>
                        <select className="mt-1 w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
                            <option>User Activity</option>
                            <option>AI Usage</option>
                            <option>System Health</option>
                            <option>Financial Summary</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-300">Date Range</label>
                        <input type="date" className="mt-1 w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-300">Format</label>
                        <select className="mt-1 w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-cyan">
                            <option>PDF</option>
                            <option>CSV</option>
                            <option>JSON</option>
                        </select>
                    </div>
                     <button className="w-full mt-4 px-5 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple">
                        Generate Report
                    </button>
                </div>
                
                {/* Generated Reports List */}
                <div className="lg:w-2/3 lg:pl-6 lg:border-l lg:border-cyber-border overflow-hidden flex flex-col">
                    <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Available Reports</h3>
                    <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                        <ul className="space-y-3">
                            {reports.map(report => (
                                <li key={report.name} className="bg-black/20 p-3 rounded-lg flex items-center justify-between hover:bg-black/40">
                                    <div>
                                        <p className="font-semibold text-white">{report.name}</p>
                                        <p className="text-xs text-gray-400">{report.date} &bull; {report.size}</p>
                                    </div>
                                    <button className="p-2 rounded-md text-cyber-cyan hover:bg-cyber-cyan/20 flex items-center gap-2 border border-cyber-cyan/50">
                                       <DownloadIcon/>
                                       <span className="text-sm font-bold">{report.format}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Reports;
