import React, { useMemo } from 'react';
import { BookingAccommodationL3Section } from '../types';
import { accommodations } from '../data';
import HotelCard from '../components/HotelCard';
import GlassCard from '../../../components/GlassCard';
import * as ToolIcons from '../components/ToolIcons';

interface BookingProps {
    type: BookingAccommodationL3Section;
}

const SearchInput: React.FC<{ icon: React.FC<{ className?: string }>, placeholder: string, type?: string, value?: string }> = ({ icon: Icon, placeholder, type = 'text', value }) => (
    <div className="relative flex-1 min-w-[150px]">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input 
            type={type} 
            placeholder={placeholder}
            defaultValue={value}
            className="w-full bg-black/30 border border-cyber-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300"
        />
    </div>
);

const Booking: React.FC<BookingProps> = ({ type }) => {
    const filteredAccommodations = useMemo(() => {
        return accommodations.filter(acc => acc.type === type);
    }, [type]);

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            <GlassCard className="p-6">
                <h2 className="text-3xl font-bold text-white mb-1">Find Your Next Cyber-Stay</h2>
                <p className="text-gray-400 mb-6">Explore hotels, rentals, and unique stays across the system.</p>
                <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
                    <SearchInput icon={ToolIcons.LocationPinIcon} placeholder="Destination, City, Sector..." />
                    <div className="flex w-full md:w-auto gap-4">
                        <SearchInput icon={ToolIcons.CalendarIcon} placeholder="Check-in" type="date" />
                        <SearchInput icon={ToolIcons.CalendarIcon} placeholder="Check-out" type="date" />
                    </div>
                    <SearchInput icon={ToolIcons.UserGroupIcon} placeholder="Guests" value="2" />
                    <button className="w-full md:w-auto px-8 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple flex-shrink-0">
                        Search
                    </button>
                </div>
            </GlassCard>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
                {filteredAccommodations.map(acc => (
                    <HotelCard key={acc.id} accommodation={acc} />
                ))}
            </div>
        </div>
    );
};

export default Booking;
