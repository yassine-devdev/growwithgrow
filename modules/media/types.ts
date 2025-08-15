
export type MediaSection = 'Movies' | 'Series' | 'Anime' | 'Documentaries' | 'Live TV';

// TMDB Media Types
export interface TMDBGenre {
    id: number;
    name: string;
}

export interface TMDBMedia {
  id: number;
  title?: string; // Movies have title
  name?: string; // TV shows have name
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
}

export interface TMDBSeason {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
}

export interface TMBDEpisode {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    episode_number: number;
    still_path: string | null;
}


export interface TMDBMediaDetails extends TMDBMedia {
    genres: TMDBGenre[];
    release_date?: string; // Movie
    first_air_date?: string; // TV
    runtime?: number; // Movie
    episode_run_time?: number[]; // TV
    tagline: string;
    seasons?: TMDBSeason[]; // TV
    number_of_seasons?: number; // TV
    number_of_episodes?: number; // TV
}
