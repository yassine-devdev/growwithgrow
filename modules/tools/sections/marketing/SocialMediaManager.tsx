import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import * as SocialIcons from './SocialMediaIcons';
import { generateText, generateImages } from '../../../../services/geminiService';
import { PromptIcon } from '../../components/Icons';

const platforms = [
    { id: 'facebook', name: 'Facebook', icon: SocialIcons.FacebookIcon, color: 'text-[#1877F2]' },
    { id: 'instagram', name: 'Instagram', icon: SocialIcons.InstagramIcon, color: 'text-[#E4405F]' },
    { id: 'tiktok', name: 'TikTok', icon: SocialIcons.TikTokIcon, color: 'text-white' },
    { id: 'linkedin', name: 'LinkedIn', icon: SocialIcons.LinkedInIcon, color: 'text-[#0A66C2]' },
    { id: 'pinterest', name: 'Pinterest', icon: SocialIcons.PinterestIcon, color: 'text-[#E60023]' },
    { id: 'snapchat', name: 'Snapchat', icon: SocialIcons.SnapchatIcon, color: 'text-yellow-300' },
];

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-full text-cyber-cyan">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-3 font-semibold animate-pulse">{text}</p>
    </div>
);


const SocialMediaManager: React.FC = () => {
    const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({
        instagram: true,
        linkedin: true
    });
    const [postContent, setPostContent] = useState('');
    const [imagePrompt, setImagePrompt] = useState('A futuristic cityscape at dusk, neon lights reflecting on wet streets.');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [error, setError] = useState('');

    const toggleConnection = (id: string) => {
        setConnectedAccounts(prev => ({...prev, [id]: !prev[id]}));
    };
    
    const handleGenerateContent = async () => {
        if (!postContent.trim()) {
            setError("Please provide a topic or draft to generate content.");
            return;
        }
        setIsLoadingContent(true);
        setError('');
        try {
            const prompt = `Based on the following topic, write a short, engaging social media post (around 2-3 sentences):\n\n"${postContent}"`;
            const response = await generateText(prompt);
            setPostContent(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate text.");
        } finally {
            setIsLoadingContent(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) {
            setError("Please enter a prompt for the image.");
            return;
        }
        setIsLoadingImage(true);
        setGeneratedImage(null);
        setError('');
        try {
            const result = await generateImages(imagePrompt);
            setGeneratedImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate image.");
        } finally {
            setIsLoadingImage(false);
        }
    };


    return (
        <div className="h-full flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white">AI Social Media Manager</h2>
            <p className="text-gray-400 -mt-4">Connect accounts, generate content with AI, and publish across platforms.</p>

            <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Connected Accounts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {platforms.map(p => (
                        <GlassCard key={p.id} className="p-3 flex flex-col items-center gap-2">
                           <p.icon className={`w-8 h-8 ${p.color}`} />
                           <span className="font-semibold text-sm">{p.name}</span>
                           <div className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${connectedAccounts[p.id] ? 'bg-cyber-cyan' : 'bg-gray-600'}`} onClick={() => toggleConnection(p.id)}>
                               <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${connectedAccounts[p.id] ? 'translate-x-7' : 'translate-x-0'}`}></div>
                           </div>
                        </GlassCard>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="p-6 flex-1 flex flex-col lg:flex-row gap-2 overflow-y-auto">
                {/* Post Composer */}
                <div className="lg:w-1/2 flex flex-col gap-4">
                    <h3 className="text-xl font-semibold text-cyber-cyan">Create Post</h3>
                    <div className="relative flex-1 flex flex-col">
                        <textarea 
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Describe your post topic or write a draft..."
                            className="w-full flex-1 bg-black/30 border border-cyber-border rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300 resize-none"
                            disabled={isLoadingContent}
                        />
                         <button onClick={handleGenerateContent} disabled={isLoadingContent} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-cyber-purple text-white font-semibold rounded-md hover:bg-cyber-purple/80">
                            <PromptIcon className="w-4 h-4" /> AI Suggest
                        </button>
                    </div>
                </div>

                {/* Media & Publishing */}
                <div className="lg:w-1/2 flex flex-col gap-4">
                     <div className="aspect-video bg-black/30 border border-dashed border-cyber-border rounded-lg flex items-center justify-center overflow-hidden">
                        {isLoadingImage ? <LoadingSpinner text="Generating..." /> : 
                         generatedImage ? <img src={generatedImage} alt={imagePrompt} className="w-full h-full object-contain"/> : 
                         <span className="text-gray-500">AI Generated Image</span>
                        }
                     </div>
                     <div className="flex gap-2">
                        <input type="text" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Describe image to generate..." className="flex-1 bg-black/30 border border-cyber-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyber-purple"/>
                        <button onClick={handleGenerateImage} disabled={isLoadingImage} className="px-4 py-2 bg-cyber-orange text-white text-sm font-bold rounded-lg hover:shadow-glow-orange">Generate</button>
                     </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                     <div className="border-t border-cyber-border pt-4">
                        <h4 className="font-semibold text-white mb-2">Publish to:</h4>
                        <div className="flex flex-wrap gap-4">
                            {platforms.filter(p => connectedAccounts[p.id]).map(p => (
                                <label key={p.id} className="flex items-center gap-2 text-sm text-gray-200">
                                    <input type="checkbox" className="w-4 h-4 accent-cyber-cyan bg-gray-700 rounded"/>
                                    {p.name}
                                </label>
                            ))}
                        </div>
                     </div>
                     <div className="flex gap-4 mt-auto">
                        <button className="flex-1 py-3 bg-cyber-surface text-white font-bold rounded-lg hover:bg-white/10">Schedule</button>
                        <button className="flex-1 py-3 bg-cyber-cyan text-black font-bold rounded-lg hover:shadow-glow-cyan">Post Now</button>
                     </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default SocialMediaManager;
