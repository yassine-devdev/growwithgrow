import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Venue } from '../data';

const StarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527a.99.99 0 00-.282.79l1.172 5.273c.275 1.242-.972 2.204-2.064 1.583l-4.832-2.89a.99.99 0 00-.928 0l-4.832 2.89c-1.092.62-2.339-.341-2.064-1.583l1.172-5.273a.99.99 0 00-.282-.79L.165 11.042c-.887-.76-.415-2.212.749-2.305l5.404-.433L8.4 3.21z" clipRule="evenodd" /></svg>
);

interface VenueCardProps {
    venue: Venue;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
    return (
        <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-teal-400/80 hover:shadow-glow-cyan">
            <div className="aspect-video bg-black/20 overflow-hidden relative">
                <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-bold">{venue.rating.toFixed(1)}</span>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-teal-300 transition-colors">{venue.name}</h3>
                <p className="text-xs text-gray-400 truncate">{venue.location}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {venue.services.slice(0, 3).map(service => (
                        <span key={service} className="text-[10px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full">{service}</span>
                    ))}
                </div>
                <div className="flex-1"></div>
                <button className="w-full mt-4 text-sm font-bold text-cyber-bg bg-teal-400 px-4 py-2 rounded-lg hover:bg-white transition-colors">
                    Book Session
                </button>
            </div>
        </GlassCard>
    );
};

export default VenueCard;
