import React from 'react';
import { CloseIcon } from '../../../components/icons/WindowIcons';

interface VideoPlayerModalProps {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    season?: number;
    episode?: number;
    onClose: () => void;
}

// Using a known aggregator for embeds.
const EMBED_BASE_URL = 'https://www.2embed.cc/embed';

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ tmdbId, mediaType, season, episode, onClose }) => {
    let src = '';
    if (mediaType === 'movie') {
        src = `${EMBED_BASE_URL}/movie/${tmdbId}`;
    } else if (mediaType === 'tv' && season && episode) {
        src = `${EMBED_BASE_URL}/tv/${tmdbId}?s=${season}&e=${episode}`;
    } else {
        // Fallback for TV show if no season/episode provided
        src = `${EMBED_BASE_URL}/tv/${tmdbId}`;
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex justify-end p-2">
                     <button onClick={onClose} className="p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white transition-colors z-10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-1 w-full h-full">
                     {src && (
                        <iframe
                            src={src}
                            title="Video Player"
                            className="w-full h-full border-0 rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
                }
                .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default VideoPlayerModal;
