
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { generateImages } from '../../../services/geminiService';
import { PromptIcon } from '../components/Icons'; // Using an existing relevant icon

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-full text-cyber-cyan">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 font-semibold animate-pulse">Generating image...</p>
    </div>
);

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A photorealistic image of an astronaut riding a skateboard on Mars');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const resultUrl = await generateImages(prompt);
            setImageUrl(resultUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">AI Image Generator</h2>
            <p className="text-gray-400 -mt-4">Describe the image you want to create, and let the AI bring it to life.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1">
                {/* Control Panel */}
                <GlassCard className="p-6 flex flex-col">
                    <div className="flex-1 flex flex-col gap-2">
                        <div>
                            <label className="text-lg font-semibold text-cyber-cyan flex items-center gap-2 mb-2">
                                <PromptIcon className="w-6 h-6" />
                                Your Prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A majestic cyber-dragon flying over a neon city"
                                className="w-full h-40 bg-black/30 border border-cyber-border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300 resize-none"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full mt-6 px-8 py-4 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center text-lg"
                    >
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </GlassCard>

                {/* Display Area */}
                <GlassCard className="p-4 flex items-center justify-center">
                    <div className="w-full h-full aspect-square bg-black/30 border border-dashed border-cyber-border rounded-lg flex items-center justify-center overflow-hidden">
                        {isLoading && <LoadingSpinner />}
                        {error && <div className="text-center text-red-400 p-4">{error}</div>}
                        {imageUrl && !isLoading && (
                            <img src={imageUrl} alt={prompt} className="w-full h-full object-contain" />
                        )}
                        {!imageUrl && !isLoading && !error && (
                             <div className="text-center text-gray-500">
                                <p>Your generated image will appear here.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ImageGenerator;
