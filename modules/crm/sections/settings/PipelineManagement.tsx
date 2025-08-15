

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { DragHandleIcon, PlusIcon, CloseIcon } from '../../components/Icons';

interface Stage {
    id: number;
    name: string;
}

const initialStages: Stage[] = [
    { id: 1, name: 'Lead In' },
    { id: 2, name: 'Contact Made' },
    { id: 3, name: 'Proposal Sent' },
    { id: 4, name: 'Negotiation' },
    { id: 5, name: 'Won' },
    { id: 6, name: 'Lost' },
];

const PipelineManagement: React.FC = () => {
    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [newStageName, setNewStageName] = useState('');

    const handleAddStage = () => {
        if (newStageName.trim()) {
            const newStage: Stage = {
                id: Date.now(),
                name: newStageName.trim(),
            };
            setStages([...stages, newStage]);
            setNewStageName('');
        }
    };

    const handleDeleteStage = (id: number) => {
        setStages(stages.filter(stage => stage.id !== id));
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">Pipeline Settings</h2>
            <p className="text-gray-400 -mt-4">Customize the stages of your sales pipeline.</p>

            <GlassCard className="p-6 flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Deal Stages</h3>
                    <div className="space-y-3 mb-6">
                        {stages.map(stage => (
                            <div key={stage.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg group">
                                <button className="text-gray-500 cursor-grab"><DragHandleIcon className="w-5 h-5"/></button>
                                <input 
                                    type="text"
                                    defaultValue={stage.name}
                                    className="flex-grow bg-transparent border-none text-white focus:outline-none focus:ring-0"
                                />
                                <button onClick={() => handleDeleteStage(stage.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-cyber-border">
                        <input 
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Add new stage"
                            className="flex-grow bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple"
                        />
                        <button onClick={handleAddStage} className="p-2 bg-cyber-purple rounded-md text-white hover:shadow-glow-purple transition-shadow">
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default PipelineManagement;
