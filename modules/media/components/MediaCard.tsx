
import React from 'react';
import { TMDBMedia } from '../../../types';
import { IMAGE_BASE_URL } from '../../../services/tmdbService';

interface MediaCardProps {
    media: TMDBMedia;
    onClick: () => void;
}

const StarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527a.99.99 0 00-.282.79l1.172 5.273c.275 1.242-.972 2.204-2.064 1.583l-4.832-2.89a.99.99 0 00-.928 0l-4.832 2.89c-1.092.62-2.339-.341-2.064-1.583l1.172-5.273a.99.99 0 00-.282-.79L.165 11.042c-.887-.76-.415-2.212.749-2.305l5.404-.433L8.4 3.21z" clipRule="evenodd" />
    </svg>
);


const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
    const title = media.title || media.name;
    const imageUrl = media.poster_path ? `${IMAGE_BASE_URL}w500${media.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

    return (
        <div 
            onClick={onClick}
            className="bg-cyber-surface rounded-lg overflow-hidden group cursor-pointer border-2 border-transparent hover:border-cyber-cyan transition-all duration-300 aspect-[2/3] relative"
            title={title}
        >
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 sm:p-3 flex flex-col justify-end">
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-md">{title}</h3>
                {media.vote_average > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-white text-xs sm:text-sm font-semibold">{media.vote_average.toFixed(1)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaCard;
