import React, { useMemo } from 'react';
import { FoodL3Section } from '../types';
import { restaurants } from '../data';
import GlassCard from '../../../components/GlassCard';
import * as ToolIcons from '../components/ToolIcons';
import RestaurantCard from '../components/RestaurantCard';
import Placeholder from '../../../components/Placeholder';

interface FoodProps {
    type: FoodL3Section;
}

const SearchInput: React.FC<{ icon: React.FC<{ className?: string }>, placeholder: string }> = ({ icon: Icon, placeholder }) => (
    <div className="relative flex-1 min-w-[150px]">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input 
            type="text" 
            placeholder={placeholder}
            className="w-full bg-black/30 border border-cyber-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300"
        />
    </div>
);

const Food: React.FC<FoodProps> = ({ type }) => {
    const filteredRestaurants = useMemo(() => {
        if (type === 'Restaurants' || type === 'Delivery') {
            return restaurants.filter(r => r.category === type);
        }
        return [];
    }, [type]);

    if (!['Restaurants', 'Delivery'].includes(type)) {
        return <Placeholder sectionName={type} />;
    }

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            <GlassCard className="p-6">
                <h2 className="text-3xl font-bold text-white mb-1">Cyber-Eats Network</h2>
                <p className="text-gray-400 mb-6">Discover local eateries and nutrient paste distributors.</p>
                <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
                    <SearchInput icon={ToolIcons.ForkKnifeIcon} placeholder="Restaurant, Cuisine, Dish..." />
                    <SearchInput icon={ToolIcons.LocationPinIcon} placeholder="Sector, District..." />
                    <button className="w-full md:w-auto px-8 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple flex-shrink-0">
                        Find Food
                    </button>
                </div>
            </GlassCard>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
                {filteredRestaurants.map(r => (
                    <RestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
        </div>
    );
};

export default Food;
