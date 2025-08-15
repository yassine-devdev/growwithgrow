import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Event } from '../data';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-pink-500/80 hover:shadow-glow-purple">
            <div className="aspect-video bg-black/20 overflow-hidden relative">
                <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold drop-shadow-lg">{event.name}</h3>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="text-sm">
                    <p className="font-semibold text-gray-300">{event.date}</p>
                    <p className="text-xs text-gray-400">{event.location}</p>
                </div>
                <div className="flex-1"></div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-cyber-border/50">
                    <p className="text-xl font-mono font-bold text-white">{event.price} <span className="text-sm font-sans">Credits</span></p>
                    <button className="text-sm font-bold text-cyber-bg bg-pink-500 px-4 py-2 rounded-lg hover:bg-white transition-colors">
                        Get Tickets
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export default EventCard;
