import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Attraction } from '../data';

interface LocalAttractionCardProps {
    attraction: Attraction;
}

const LocalAttractionCard: React.FC<LocalAttractionCardProps> = ({ attraction }) => {
    return (
        <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-yellow-400/80 hover:shadow-glow-orange">
            <div className="aspect-video bg-black/20 overflow-hidden">
                <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-yellow-300 transition-colors">{attraction.name}</h3>
                <p className="text-xs text-gray-400 truncate">{attraction.location}</p>
                <p className="text-sm text-gray-300 mt-2 flex-1">{attraction.description}</p>
                <button className="w-full mt-4 text-sm font-bold text-cyber-bg bg-yellow-400 px-4 py-2 rounded-lg hover:bg-white transition-colors">
                    Explore
                </button>
            </div>
        </GlassCard>
    );
};

export default LocalAttractionCard;
