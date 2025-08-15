import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { generateSeoMetadata } from '../../../../services/geminiService';
import { SeoMetadata } from '../../types';
import { ClipboardIcon, CheckIcon } from '../../../../components/icons/InterfaceIcons';

// A component to render the Google Search preview
const SerpPreview: React.FC<{ title: string; description: string; url: string }> = ({ title, description, url }) => {
    return (
        <div className="p-3 bg-black/30 rounded-lg font-roboto">
            <div className="text-sm text-gray-300">{url}</div>
            <div className="text-xl text-blue-400 hover:underline cursor-pointer truncate">{title}</div>
            <div className="text-sm text-gray-400 mt-1">{description}</div>
        </div>
    );
};

const AITitleMetaGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('Futuristic Cyberpunk HUD Interface');
    const [audience, setAudience] = useState<string>('Developers and UI/UX designers');
    const [tone, setTone] = useState<string>('Professional');
    const [results, setResults] = useState<SeoMetadata[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic or keywords.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await generateSeoMetadata(topic, audience, tone);
            setResults(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (textToCopy: string, id: number) => {
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-2">
            {/* Control Panel */}
            <GlassCard className="lg:w-1/3 p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2">AI Title & Meta Generator</h2>
                <p className="text-gray-400 mb-6 text-sm">Generate compelling, SEO-friendly titles and meta descriptions for your web pages.</p>

                <div className="space-y-4 flex-1 flex flex-col">
                    <div>
                        <label className="text-sm font-semibold text-cyber-cyan flex items-center gap-2 mb-1">
                            Topic or Keywords
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Real-time data visualization dashboard"
                            className="w-full bg-black/30 border border-cyber-border rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple"
                        />
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-1">
                            Target Audience (Optional)
                        </label>
                        <input
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g., Marketing managers"
                            className="w-full bg-black/30 border border-cyber-border rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-1">
                            Tone of Voice (Optional)
                        </label>
                        <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-black/30 border border-cyber-border rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple">
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Witty</option>
                            <option>Persuasive</option>
                            <option>Informative</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full mt-6 px-8 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                    {isLoading ? 'Generating...' : 'Generate Metadata'}
                </button>
            </GlassCard>

            {/* Results Panel */}
            <GlassCard className="lg:w-2/3 p-6 flex-1 flex flex-col overflow-hidden">
                <h3 className="text-xl font-semibold text-white mb-4">Generated Results</h3>
                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-cyber-cyan mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-gray-400">Generating SEO magic...</p>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-center text-red-400 p-4">{error}</div>}
                    {!isLoading && !error && results.length === 0 && (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                           <p>Generated titles and descriptions will appear here.</p>
                        </div>
                    )}
                    {!isLoading && results.length > 0 && (
                        <div className="space-y-6">
                            {results.map((result, index) => (
                                <div key={index}>
                                    <SerpPreview title={result.title} description={result.description} url="https://www.example.com/page-path" />
                                    <div className="mt-2 text-right">
                                        <button 
                                            onClick={() => handleCopy(`Title: ${result.title}\n\nDescription: ${result.description}`, index)}
                                            className="flex items-center gap-2 px-3 py-1 text-xs bg-cyber-surface text-gray-300 font-semibold rounded-md hover:bg-white/10"
                                        >
                                            {copiedId === index ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                            {copiedId === index ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default AITitleMetaGenerator;
