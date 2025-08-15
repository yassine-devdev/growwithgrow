import React, { useState, useMemo, useEffect } from 'react';
import { ModuleSection } from '../../types';
import { LeisureLifestyleSection, ServicesL3Section, ServicesL4Section, BookingAccommodationL3Section, FlightsL3Section, FoodL3Section, EventsL3Section, SpaGymL3Section, LocalL3Section } from './types';
import { LEISURE_LIFESTYLE_L3_MAP, SERVICES_L4_MAP } from '../../constants';
import * as ToolIcons from './components/ToolIcons';
import Placeholder from '../../components/Placeholder';
import GlassCard from '../../components/GlassCard';
import Booking from './sections/Booking';
import Flights from './sections/Flights';
import Food from './sections/Food';
import Events from './sections/Events';
import SpaGym from './sections/SpaGym';
import Local from './sections/Local';

interface LeisureLifestyleProps {
    activeSection: LeisureLifestyleSection; // This is L2
}

const ToolButton: React.FC<{
  label: string;
  icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      title={label}
      className={`w-full h-[70px] flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-in-out group p-1
        ${isActive
          ? 'bg-cyber-purple/20 text-cyber-purple'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);

const toolIcons: Record<string, React.FC<{ className?: string }>> = {
    // Booking & Accommodation
    'Hotels': ToolIcons.HotelsIcon, 'Vacation Rentals': ToolIcons.VacationRentalsIcon,
    'Hostels': ToolIcons.HostelsIcon, 'Homestays': ToolIcons.HomestaysIcon,
    // Flights
    'Search': ToolIcons.PlaneTakeoffIcon, 'My Trips': ToolIcons.MyTripsIcon, 'Deals': ToolIcons.DealsIcon,
    'Check-in': ToolIcons.CheckInIcon,
    // Food
    'Restaurants': ToolIcons.RestaurantsIcon, 'Delivery': ToolIcons.DeliveryIcon,
    'Groceries': ToolIcons.GroceriesIcon, 'Recipes': ToolIcons.RecipesIcon,
    // Events
    'Concerts': ToolIcons.ConcertsIcon, 'Sports': ToolIcons.SportsIcon,
    'Theatre': ToolIcons.TheatreIcon, 'Expos': ToolIcons.ExposIcon,
    // Spa & Gym
    'Spa': ToolIcons.SpaIcon, 'Gyms': ToolIcons.DumbbellIcon,
    'Coaches': ToolIcons.CoachesIcon, 'Booking': ToolIcons.BookingIcon,
    // Local
    'Attractions': ToolIcons.AttractionsIcon, 'Guides': ToolIcons.GuidesIcon,
    'Tours': ToolIcons.ToursIcon, 'Offers': ToolIcons.OffersIcon,
    // Services
    'Moving & Storage': ToolIcons.MovingStorageIcon, 'Cleaning Services': ToolIcons.CleaningIcon,
    'Maintenance & Handyman': ToolIcons.HandymanIcon, 'AC Services': ToolIcons.ACIcon,
    'Pest Control': ToolIcons.PestControlIcon, 'Gardening': ToolIcons.GardeningIcon,
    'Nanny & Maid Services': ToolIcons.NannyMaidIcon, 'Automotive': ToolIcons.AutomotiveIcon,
    'Professional': ToolIcons.ProfessionalServicesIcon,
};


const ServiceCategoryView: React.FC<{ title: string; services: ServicesL4Section[] }> = ({ title, services }) => {
    return (
        <div className="h-full flex flex-col gap-2">
            <div>
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">Browse available services in this category.</p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto pr-2">
                {services.map(service => (
                    <GlassCard key={service} className="p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyber-purple transition-colors">
                        <h3 className="text-lg font-bold text-white">{service}</h3>
                        <button className="mt-4 text-sm font-semibold text-cyber-cyan bg-cyber-cyan/10 px-4 py-2 rounded-lg hover:bg-cyber-cyan/20">
                            Book Now
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};


const LeisureLifestyle: React.FC<LeisureLifestyleProps> = ({ activeSection }) => {
    const [activeTool, setActiveTool] = useState<ModuleSection | null>(null); // This is L3

    const toolItems = useMemo(() => {
        return LEISURE_LIFESTYLE_L3_MAP[activeSection] || [];
    }, [activeSection]);
    
    useEffect(() => {
        setActiveTool(toolItems[0] || null);
    }, [activeSection, toolItems]);
    
    const renderContent = () => {
        if (!activeTool) return <Placeholder sectionName={activeSection} />;

        switch (activeSection) {
            case 'Booking & Accommodation':
                return <Booking type={activeTool as BookingAccommodationL3Section} />;
            case 'Flights':
                return <Flights type={activeTool as FlightsL3Section} />;
            case 'Food':
                return <Food type={activeTool as FoodL3Section} />;
            case 'Events':
                return <Events type={activeTool as EventsL3Section} />;
            case 'Spa & Gym':
                return <SpaGym type={activeTool as SpaGymL3Section} />;
            case 'Local':
                return <Local type={activeTool as LocalL3Section} />;
            case 'Services':
                if (SERVICES_L4_MAP[activeTool as ServicesL3Section]) {
                    const subServices = SERVICES_L4_MAP[activeTool as ServicesL3Section] as ServicesL4Section[];
                    return <ServiceCategoryView title={activeTool as string} services={subServices} />;
                }
                break;
        }
        
        return <Placeholder sectionName={activeTool as string} />;
    };

    return (
        <div className="h-full flex text-white overflow-hidden">
            <aside className="w-[90px] flex-shrink-0 bg-black/20 p-2 border-r border-cyber-border flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 w-full">
                    {toolItems.map(item => {
                        if (!item) return null;
                        const Icon = toolIcons[item as string] || ToolIcons.DefaultIcon;
                         return (
                            <ToolButton
                                key={item}
                                label={item as string}
                                icon={Icon}
                                isActive={activeTool === item}
                                onClick={() => setActiveTool(item)}
                            />
                        )
                    })}
                </div>
            </aside>

            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto min-w-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default LeisureLifestyle;
