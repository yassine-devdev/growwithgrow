

import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const recentImports = [
    { id: 1, file: 'students_2024.csv', user: 'Admin User', date: '2024-07-22 10:45', status: 'Completed' },
    { id: 2, file: 'staff_update.csv', user: 'Admin User', date: '2024-07-21 15:20', status: 'Completed' },
    { id: 3, file: 'schools_new.csv', user: 'Admin User', date: '2024-07-20 09:00', status: 'Failed' },
];

const statusClasses: { [key: string]: string } = {
    Completed: 'bg-green-500/30 text-green-300',
    Failed: 'bg-red-500/30 text-red-300',
};

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


const DataImport: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Data Import Center</h2>
            <p className="text-gray-400 -mt-4">Bulk upload schools, students, or staff data.</p>
            
            <GlassCard className="p-6 flex-1 flex flex-col gap-2">
                <div className="border-2 border-dashed border-cyber-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyber-cyan hover:bg-cyber-surface/50 transition-colors">
                    <UploadIcon />
                    <p className="mt-4 text-white font-semibold">Drag & drop files here</p>
                    <p className="text-gray-400 text-sm">or click to browse</p>
                    <p className="text-xs text-gray-500 mt-2">Supports: CSV, XLSX</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Recent Imports</h3>
                    <div className="overflow-y-auto">
                         <table className="w-full text-left">
                            <thead className="sticky top-0 bg-cyber-surface/80 backdrop-blur-sm">
                                <tr>
                                    {['File Name', 'Uploaded By', 'Date', 'Status'].map(h => (
                                        <th key={h} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-cyber-border">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cyber-border/50">
                                {recentImports.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5">
                                        <td className="p-3 font-medium text-white">{item.file}</td>
                                        <td className="p-3 text-gray-400">{item.user}</td>
                                        <td className="p-3 text-gray-400">{item.date}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[item.status]}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default DataImport;
