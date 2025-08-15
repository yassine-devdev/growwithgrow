import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Restaurant } from '../data';

const StarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527a.99.99 0 00-.282.79l1.172 5.273c.275 1.242-.972 2.204-2.064 1.583l-4.832-2.89a.99.99 0 00-.928 0l-4.832 2.89c-1.092.62-2.339-.341-2.064-1.583l1.172-5.273a.99.99 0 00-.282-.79L.165 11.042c-.887-.76-.415-2.212.749-2.305l5.404-.433L8.4 3.21z" clipRule="evenodd" />
    </svg>
);

interface RestaurantCardProps {
    restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    return (
        <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-cyber-orange/80 hover:shadow-glow-orange">
            <div className="aspect-video bg-black/20 overflow-hidden relative">
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-bold">{restaurant.rating.toFixed(1)}</span>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-cyber-orange transition-colors">{restaurant.name}</h3>
                <p className="text-xs text-gray-400 truncate">{restaurant.cuisine}</p>
                <div className="flex-1"></div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-cyber-border/50">
                    <p className="text-xl font-mono font-bold text-white">{restaurant.priceRange}</p>
                    <button className="text-sm font-bold text-cyber-bg bg-cyber-orange px-4 py-2 rounded-lg hover:bg-white transition-colors">
                        {restaurant.category === 'Delivery' ? 'Order Now' : 'Book Table'}
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export default RestaurantCard;
