
import React from 'react';
import { PromptIcon } from '../components/ToolIcons';

interface DesignerControlsProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const DesignerControls: React.FC<DesignerControlsProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
    return (
        <div className="p-4 bg-cyber-surface/80 backdrop-blur-sm border-t border-cyber-border flex items-center gap-4">
            <div className="relative flex-grow">
                 <PromptIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A modern dashboard with a sidebar and cards"
                    className="w-full bg-black/30 border border-cyber-border rounded-full py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-orange"
                    disabled={isLoading}
                />
            </div>
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="px-6 py-3 bg-cyber-orange text-white font-bold rounded-full transition-all duration-300 ease-in-out hover:shadow-glow-orange disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generating...' : 'Generate'}
            </button>
        </div>
    );
};

export default DesignerControls;
