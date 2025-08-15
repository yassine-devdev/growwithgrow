

import React from 'react';
import GlassCard from '../../../../components/GlassCard';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ImportExport: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Import & Export Contacts</h2>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                <GlassCard className="p-6 flex flex-col">
                    <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Import Contacts</h3>
                    <div className="flex-1 border-2 border-dashed border-cyber-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyber-cyan hover:bg-cyber-surface/50 transition-colors">
                        <UploadIcon />
                        <p className="mt-4 text-white font-semibold">Drag & drop CSV file here</p>
                        <p className="text-gray-400 text-sm">or click to browse</p>
                    </div>
                </GlassCard>
                 <GlassCard className="p-6 flex flex-col">
                    <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Export Contacts</h3>
                    <div className="flex-1 flex flex-col justify-center items-start">
                         <p className="text-gray-400 mb-4">Export all of your contact data into a single CSV file.</p>
                         <button className="px-5 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple">
                            Export All Contacts
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ImportExport;
