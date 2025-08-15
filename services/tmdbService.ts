import { TMDBMedia, TMDBMediaDetails, TMDBGenre, TMBDEpisode } from '../types';

// IMPORTANT: In a production environment, these keys should be stored securely
// in environment variables and not hardcoded.
const API_KEY = 'a7402390b78233b487120be5b0e8158d';
const API_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

interface FetchOptions {
    params?: Record<string, string | number>;
}

const fetchFromTMDB = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const { params = {} } = options;
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    
    for (const key in params) {
        url.searchParams.append(key, String(params[key]));
    }
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.status_message || 'Failed to fetch data from TMDB');
        }
        return response.json();
    } catch (error) {
        console.error(`TMDB API Error fetching ${endpoint}:`, error);
        throw error;
    }
};

type MediaCategory = 'movie' | 'tv';

interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export const getTrending = (mediaType: MediaCategory): Promise<PaginatedResponse<TMDBMedia>> => {
    return fetchFromTMDB(`/trending/${mediaType}/week`);
};

export const getPopular = (mediaType: MediaCategory): Promise<PaginatedResponse<TMDBMedia>> => {
    return fetchFromTMDB(`/${mediaType}/popular`);
};

export const getTopRated = (mediaType: MediaCategory): Promise<PaginatedResponse<TMDBMedia>> => {
    return fetchFromTMDB(`/${mediaType}/top_rated`);
};

export const getNowPlaying = (mediaType: MediaCategory): Promise<PaginatedResponse<TMDBMedia>> => {
    const endpoint = mediaType === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    return fetchFromTMDB(endpoint);
};

export const getGenres = (mediaType: MediaCategory): Promise<{ genres: TMDBGenre[] }> => {
    return fetchFromTMDB(`/genre/${mediaType}/list`);
};

export const getMediaByGenre = (mediaType: MediaCategory, genreId: number): Promise<PaginatedResponse<TMDBMedia>> => {
    return fetchFromTMDB(`/discover/${mediaType}`, { params: { with_genres: genreId } });
};

export const searchMedia = (mediaType: MediaCategory, query: string): Promise<PaginatedResponse<TMDBMedia>> => {
    return fetchFromTMDB(`/search/${mediaType}`, { params: { query } });
};

export const getMediaDetails = (mediaType: MediaCategory, id: number): Promise<TMDBMediaDetails> => {
    return fetchFromTMDB(`/${mediaType}/${id}`);
};

export const getSeasonDetails = (tvId: number, seasonNumber: number): Promise<{ episodes: TMBDEpisode[] }> => {
    return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
};
