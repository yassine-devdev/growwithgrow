import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Flight } from '../data';
import { PlaneTakeoffIcon } from './ToolIcons';

interface FlightCardProps {
    flight: Flight;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
    return (
        <GlassCard className="p-4 flex flex-col group transition-all duration-300 hover:border-cyber-cyan/80 hover:shadow-glow-cyan">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <img src={flight.airlineLogoUrl} alt={flight.airline} className="w-10 h-10 rounded-full bg-white/10 p-1" />
                    <div>
                        <p className="font-bold text-white text-lg">{flight.airline}</p>
                        <p className="text-xs text-gray-400">{flight.flightNumber}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${flight.direct ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {flight.direct ? 'Direct' : '1+ Stop'}
                </span>
            </div>
            <div className="flex items-center justify-between my-4">
                <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-white">{flight.origin.code}</p>
                    <p className="text-xs text-gray-400">{flight.origin.time}</p>
                </div>
                <div className="flex-1 flex flex-col items-center text-cyber-cyan">
                    <div className="w-full border-b-2 border-dashed border-cyber-border/50"></div>
                    <PlaneTakeoffIcon className="w-5 h-5 -mt-2.5 bg-cyber-bg px-1" />
                    <p className="text-xs mt-1">{flight.duration}</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-white">{flight.destination.code}</p>
                    <p className="text-xs text-gray-400">{flight.destination.time}</p>
                </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-cyber-border/50">
                <div>
                    <p className="text-xl font-mono font-bold text-white">{flight.price}</p>
                    <p className="text-xs text-gray-500 font-semibold">CREDITS</p>
                </div>
                <button className="text-sm font-bold text-cyber-bg bg-cyber-cyan px-4 py-2 rounded-lg hover:bg-white transition-colors">Select</button>
            </div>
        </GlassCard>
    );
};

export default FlightCard;
