

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MEDIA_DATA } from '../../constants';
import { MediaSection, TMDBMedia, TMDBGenre } from './types';
import * as MediaToolIcons from './components/MediaToolIcons';
import * as tmdbService from '../../services/tmdbService';
import MediaCard from './components/MediaCard';
import MediaDetailModal from './components/MediaDetailModal';
import VideoPlayerModal from './components/VideoPlayerModal';

const toolIcons: Record<string, React.FC<{ className?: string }>> = {
    'Featured': MediaToolIcons.FeaturedIcon,
    'My List': MediaToolIcons.MyListIcon, // Mapped to "Popular"
    'Genres': MediaToolIcons.GenresIcon,
    'New Releases': MediaToolIcons.NewReleasesIcon,
    'Search': MediaToolIcons.SearchIcon,
    'Trending': MediaToolIcons.TrendingIcon,
    'Top Rated': MediaToolIcons.TopRatedIcon,
    'Categories': MediaToolIcons.CategoriesIcon,
    'Award Winners': MediaToolIcons.AwardWinnersIcon,
    'Guide': MediaToolIcons.GuideIcon,
    'My Channels': MediaToolIcons.MyChannelsIcon,
    'Recordings': MediaToolIcons.RecordingsIcon,
};

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <svg className="animate-spin h-10 w-10 text-cyber-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

type MediaApiCategory = 'movie' | 'tv';

const getApiCategory = (category: MediaSection): MediaApiCategory => {
    // TMDB doesn't have specific categories for Anime/Documentaries, they are genres.
    // We'll treat them as Movies or TV for API calls.
    return (category === 'Series' || category === 'Live TV' || category === 'Anime') ? 'tv' : 'movie';
}

// Map sub-nav tools to TMDB endpoints/actions
const toolActionMap: Record<string, (apiCategory: MediaApiCategory, params?: any) => Promise<any>> = {
    'Featured': (apiCategory) => tmdbService.getTrending(apiCategory),
    'Trending': (apiCategory) => tmdbService.getTrending(apiCategory),
    'My List': (apiCategory) => tmdbService.getPopular(apiCategory), // Using popular as a stand-in
    'New Releases': (apiCategory) => tmdbService.getNowPlaying(apiCategory),
    'Top Rated': (apiCategory) => tmdbService.getTopRated(apiCategory),
    'Award Winners': (apiCategory) => tmdbService.getTopRated(apiCategory), // Using top-rated as a stand-in
    'Genres': (apiCategory) => tmdbService.getGenres(apiCategory),
    'Categories': (apiCategory) => tmdbService.getGenres(apiCategory),
    'Search': (apiCategory, params) => tmdbService.searchMedia(apiCategory, params.query),
    'Guide': (apiCategory) => tmdbService.getNowPlaying(apiCategory),
    'My Channels': (apiCategory) => tmdbService.getPopular(apiCategory),
    'Recordings': (apiCategory) => tmdbService.getTopRated(apiCategory),
};

const MediaContent: React.FC<{ category: MediaSection, tool: string, onMediaSelect: (id: number) => void }> = ({ category, tool, onMediaSelect }) => {
    const [data, setData] = useState<TMDBMedia[] | TMDBGenre[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const apiCategory = useMemo(() => getApiCategory(category), [category]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (tool === 'Genres' || tool === 'Categories') {
                if (selectedGenre) {
                    const response = await tmdbService.getMediaByGenre(apiCategory, selectedGenre);
                    setData(response.results);
                } else {
                    const response = await tmdbService.getGenres(apiCategory);
                    setData(response.genres);
                }
            } else if (tool === 'Search') {
                if(searchQuery) {
                    const response = await toolActionMap[tool](apiCategory, { query: searchQuery });
                    setData(response.results);
                } else {
                    setData([]);
                }
            } else {
                const action = toolActionMap[tool] || tmdbService.getTrending;
                const response = await action(apiCategory);
                setData(response.results);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load media.');
        } finally {
            setIsLoading(false);
        }
    }, [tool, apiCategory, selectedGenre, searchQuery]);

    useEffect(() => {
        setSelectedGenre(null);
        setSearchQuery('');
        setData([]);
    }, [category, tool]);

    useEffect(() => {
        // Debounce search query
        if (tool === 'Search') {
            const handler = setTimeout(() => {
                if (searchQuery) fetchData();
            }, 500);
            return () => clearTimeout(handler);
        }
        
        fetchData();
    }, [fetchData, tool, searchQuery]);

    const handleGenreClick = (genreId: number) => {
        setSelectedGenre(genreId);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

    if ((tool === 'Genres' || tool === 'Categories') && !selectedGenre) {
        return (
            <div className="p-2 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-cyber-cyan mb-4 sm:mb-6">Select a Genre</h2>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                    {(data as TMDBGenre[]).map(genre => (
                        <button key={genre.id} onClick={() => handleGenreClick(genre.id)} className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-cyber-surface hover:bg-cyber-purple/50 rounded-lg text-white font-semibold transition-colors">
                            {genre.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (tool === 'Search') {
        return (
             <div className="p-2 sm:p-6 h-full flex flex-col">
                <div className="relative mb-4 sm:mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search for ${category}...`}
                        className="w-full bg-black/30 border border-cyber-border rounded-full py-2 sm:py-3 pl-10 sm:pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan text-base sm:text-lg"
                    />
                    <MediaToolIcons.SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                {(data as TMDBMedia[]).length > 0 ? (
                    <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 overflow-y-auto pr-2">
                        {(data as TMDBMedia[]).map(item => item.poster_path && <MediaCard key={item.id} media={item} onClick={() => onMediaSelect(item.id)} />)}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                       {searchQuery ? <p>No results found for "{searchQuery}"</p> : <p>Start typing to search.</p>}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col p-2 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyber-cyan mb-1">{tool}</h2>
            <p className="text-gray-300 mb-4 sm:mb-6">Showing content for {category}</p>
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 overflow-y-auto pr-2">
                {(data as TMDBMedia[]).map(item => item.poster_path && <MediaCard key={item.id} media={item} onClick={() => onMediaSelect(item.id)} />)}
            </div>
        </div>
    );
};

const Media: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<MediaSection>(MEDIA_DATA[0].category);
    const [activeTool, setActiveTool] = useState<string>(MEDIA_DATA[0].items[0]);

    const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [playerConfig, setPlayerConfig] = useState<{ id: number; s?: number; e?: number }>({ id: 0 });

    const handleCategoryClick = (category: MediaSection) => {
        setActiveCategory(category);
        const items = MEDIA_DATA.find(data => data.category === category)?.items || [];
        setActiveTool(items[0] || 'Featured');
    };

    const handlePlay = (id: number, season?: number, episode?: number) => {
        setPlayerConfig({ id, s: season, e: episode });
        setSelectedMediaId(null);
        setShowPlayer(true);
    };

    const toolItems = useMemo(() => {
        return MEDIA_DATA.find(data => data.category === activeCategory)?.items || [];
    }, [activeCategory]);
    
    const apiCategory = useMemo(() => getApiCategory(activeCategory), [activeCategory]);

    return (
        <div className="h-full flex flex-col text-white overflow-hidden">
            <header className="flex-shrink-0 p-2 sm:p-4 bg-black/20 border-b border-cyber-border">
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                    {MEDIA_DATA.map(({ category }) => (
                        <button key={category} onClick={() => handleCategoryClick(category)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${activeCategory === category ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-glow-cyan' : 'text-gray-300 hover:bg-cyber-surface hover:text-cyber-cyan'}`}>
                            {category}
                        </button>
                    ))}
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-[80px] flex-shrink-0 bg-black/20 p-2 border-r border-cyber-border flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2 w-full">
                        {toolItems.map(item => {
                            const Icon = toolIcons[item] || MediaToolIcons.DefaultIcon;
                             return (
                                <button key={item} onClick={() => setActiveTool(item)} title={item}
                                    className={`w-full h-[75px] flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-1 ${activeTool === item ? 'bg-cyber-surface text-cyber-cyan border-2 border-cyber-cyan' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
                                    <span className="text-[10px] font-medium text-center leading-tight">{item}</span>
                                </button>
                            )
                        })}
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto">
                    <MediaContent category={activeCategory} tool={activeTool} onMediaSelect={setSelectedMediaId} />
                </main>
            </div>

            {selectedMediaId && (
                <MediaDetailModal 
                    mediaId={selectedMediaId} 
                    mediaType={apiCategory}
                    onClose={() => setSelectedMediaId(null)}
                    onPlay={handlePlay}
                />
            )}

            {showPlayer && (
                 <VideoPlayerModal
                    tmdbId={playerConfig.id}
                    mediaType={apiCategory}
                    season={playerConfig.s}
                    episode={playerConfig.e}
                    onClose={() => setShowPlayer(false)}
                />
            )}
        </div>
    );
};

export default Media;
