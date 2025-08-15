import React, { useState, useEffect } from 'react';
import { TMDBMediaDetails, TMDBSeason, TMBDEpisode } from '../../../types';
import * as tmdbService from '../../../services/tmdbService';
import { CloseIcon } from '../../../components/icons/WindowIcons';

const StarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527a.99.99 0 00-.282.79l1.172 5.273c.275 1.242-.972 2.204-2.064 1.583l-4.832-2.89a.99.99 0 00-.928 0l-4.832 2.89c-1.092.62-2.339-.341-2.064-1.583l1.172-5.273a.99.99 0 00-.282-.79L.165 11.042c-.887-.76-.415-2.212.749-2.305l5.404-.433L8.4 3.21z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <svg className="animate-spin h-10 w-10 text-cyber-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


interface MediaDetailModalProps {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    onClose: () => void;
    onPlay: (id: number, season?: number, episode?: number) => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ mediaId, mediaType, onClose, onPlay }) => {
    const [details, setDetails] = useState<TMDBMediaDetails | null>(null);
    const [episodes, setEpisodes] = useState<TMBDEpisode[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const data = await tmdbService.getMediaDetails(mediaType, mediaId);
            setDetails(data);
            if (mediaType === 'tv' && data.seasons && data.seasons.length > 0) {
                const initialSeason = data.seasons.find(s => s.season_number === 1) || data.seasons[0];
                setSelectedSeason(initialSeason.season_number);
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [mediaId, mediaType]);

    useEffect(() => {
        if (mediaType === 'tv' && details) {
            const fetchEpisodes = async () => {
                const data = await tmdbService.getSeasonDetails(details.id, selectedSeason);
                setEpisodes(data.episodes);
            };
            fetchEpisodes();
        }
    }, [details, mediaType, selectedSeason]);

    const backdropUrl = details?.backdrop_path ? `${tmdbService.IMAGE_BASE_URL}w1280${details.backdrop_path}` : '';
    const posterUrl = details?.poster_path ? `${tmdbService.IMAGE_BASE_URL}w500${details.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const title = details?.title || details?.name;
    const releaseDate = details?.release_date || details?.first_air_date;
    const runtime = details?.runtime || (details?.episode_run_time && details.episode_run_time[0]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-cyber-bg w-full max-w-5xl h-[90vh] rounded-lg shadow-glow-purple overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {isLoading ? <LoadingSpinner/> : details && (
                    <>
                        <div className="relative h-1/2 w-full flex-shrink-0">
                            <img src={backdropUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-cyber-bg/70 to-transparent"></div>
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white transition-colors z-10">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                            <div className="relative z-0 p-8 h-full flex items-end gap-8">
                                <img src={posterUrl} alt={title} className="w-48 h-auto rounded-md shadow-2xl" />
                                <div>
                                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">{title}</h1>
                                    <p className="text-gray-300 italic mt-1">{details.tagline}</p>
                                    <div className="flex items-center gap-4 mt-4 text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span className="font-bold">{details.vote_average.toFixed(1)}</span>
                                        </div>
                                        <span>{releaseDate?.substring(0, 4)}</span>
                                        {runtime && <span>{runtime} min</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 flex gap-8 overflow-hidden">
                            <div className="w-2/3 flex flex-col overflow-y-auto pr-4">
                               <div className="flex flex-wrap gap-2 mb-4">
                                    {details.genres.map(g => <span key={g.id} className="px-3 py-1 bg-cyber-surface text-cyber-cyan text-xs font-semibold rounded-full">{g.name}</span>)}
                                </div>
                                <h2 className="text-xl text-cyber-cyan font-semibold mb-2">Overview</h2>
                                <p className="text-gray-400 leading-relaxed">{details.overview}</p>
                            </div>
                            <div className="w-1/3 flex flex-col">
                                {mediaType === 'movie' ? (
                                    <button onClick={() => onPlay(details.id)} className="w-full py-3 bg-cyber-cyan text-black font-bold rounded-lg hover:shadow-glow-cyan transition-shadow">Play Movie</button>
                                ) : (
                                    <>
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                            className="w-full bg-cyber-surface border border-cyber-border rounded-md px-3 py-2 text-white mb-4"
                                        >
                                            {details.seasons?.filter(s => s.season_number > 0).map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
                                        </select>
                                        <ul className="flex-1 overflow-y-auto space-y-2 pr-2">
                                            {episodes.map(ep => (
                                                <li key={ep.id} onClick={() => onPlay(details.id, selectedSeason, ep.episode_number)} className="p-2 bg-cyber-surface hover:bg-cyber-purple/50 rounded cursor-pointer">
                                                    <p className="font-semibold text-white truncate">E{ep.episode_number}: {ep.name}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
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

export default MediaDetailModal;
