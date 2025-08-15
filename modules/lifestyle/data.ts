import { BookingAccommodationL3Section, FlightsL3Section, FoodL3Section, EventsL3Section, SpaGymL3Section, LocalL3Section } from "./types";

export interface Accommodation {
  id: string;
  type: BookingAccommodationL3Section;
  name: string;
  location: string;
  rating: number;
  price: number;
  imageUrl: string;
  tags: string[];
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogoUrl: string;
  flightNumber: string;
  origin: { code: string; city: string; time: string; };
  destination: { code: string; city: string; time: string; };
  duration: string;
  price: number;
  direct: boolean;
}

export interface Restaurant {
  id: string;
  category: FoodL3Section;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
}

export interface Event {
  id: string;
  category: EventsL3Section;
  name: string;
  location: string;
  date: string;
  price: string;
  imageUrl: string;
}

export interface Venue {
    id: string;
    type: 'Spa' | 'Gym';
    name: string;
    location: string;
    rating: number;
    services: string[];
    imageUrl: string;
}

export interface Attraction {
    id: string;
    type: LocalL3Section;
    name: string;
    location: string;
    description: string;
    imageUrl: string;
}


export const accommodations: Accommodation[] = [
  { id: 'hotel-01', type: 'Hotels', name: 'The Orbital Grand', location: 'Sector 7G, Neo-Kyoto Sky-Spire', rating: 4.9, price: 750, imageUrl: 'https://picsum.photos/seed/hotel1/800/600', tags: ['Zero-G Pool', 'Holographic Suite', 'AI Concierge'], },
  { id: 'hotel-02', type: 'Hotels', name: 'Arakis Dune Sea Resort', location: 'Arrakeen, Geidi Prime Sector', rating: 4.7, price: 980, imageUrl: 'https://picsum.photos/seed/hotel2/800/600', tags: ['Spice Baths', 'Sandworm Watching', 'Stillsuit Rentals'], },
  { id: 'rental-01', type: 'Vacation Rentals', name: 'Blade Runner\'s Respite', location: 'Apartment 9732, Neo-Los Angeles', rating: 4.5, price: 450, imageUrl: 'https://picsum.photos/seed/rental1/800/600', tags: ['Rainy Rooftop View', 'Noodle Bar Access', 'Voight-Kampff Kit'], },
  { id: 'hostel-01', type: 'Hostels', name: 'The Glitch Inn', location: 'Data-Haven 3, Cyberia', rating: 4.2, price: 85, imageUrl: 'https://picsum.photos/seed/hostel1/800/600', tags: ['High-Speed Jack-In', 'Nutrient Paste Bar', 'Communal VR Den'], },
  { id: 'homestay-01', type: 'Homestays', name: 'Netrunner\'s Nook', location: 'The Stacks, District 12', rating: 4.8, price: 120, imageUrl: 'https://picsum.photos/seed/homestay1/800/600', tags: ['Fiber-Optic Weaving', 'Direct ICE Access', 'Home-cooked Synth-Meals'], },
  { id: 'hotel-03', type: 'Hotels', name: 'Panam\'s Palmera Sky Hotel', location: 'Dogtown, Night City', rating: 4.6, price: 650, imageUrl: 'https://picsum.photos/seed/hotel3/800/600', tags: ['Rooftop AV Pad', 'Combat Zone Views', 'Black Market Access'], },
  { id: 'rental-02', type: 'Vacation Rentals', name: 'Akira Capsule Loft', location: 'Mega-Block C, Neo-Tokyo', rating: 4.4, price: 320, imageUrl: 'https://picsum.photos/seed/rental2/800/600', tags: ['Bike Garage', 'Pill-Shaped Bed', 'Cityscape Views'], },
  { id: 'hotel-04', type: 'Hotels', name: 'Straylight Citadel', location: 'Freeside, The Sprawl', rating: 5.0, price: 1200, imageUrl: 'https://picsum.photos/seed/hotel4/800/600', tags: ['Turing Police Secured', 'Direct Cyberspace Access', 'AI Villa'], },
];

export const flights: Flight[] = [
    { id: 'flight-01', airline: 'Pan Galactic Airways', airlineLogoUrl: 'https://picsum.photos/seed/airline1/100/100', flightNumber: 'PGA-747', origin: { code: 'NRT', city: 'Neo-Tokyo', time: '08:00' }, destination: { code: 'LAX', city: 'Neo-LA', time: '17:30' }, duration: '9h 30m', price: 1200, direct: true },
    { id: 'flight-02', airline: 'EuroTrans Cargo', airlineLogoUrl: 'https://picsum.photos/seed/airline2/100/100', flightNumber: 'ETC-1138', origin: { code: 'LHR', city: 'London Grid', time: '14:00' }, destination: { code: 'JFK', city: 'New York Sprawl', time: '22:00' }, duration: '8h 00m', price: 850, direct: true },
    { id: 'flight-03', airline: 'Tyrell Corporation Shuttle', airlineLogoUrl: 'https://picsum.photos/seed/airline3/100/100', flightNumber: 'TY-OWL', origin: { code: 'LAX', city: 'Neo-LA', time: '22:00' }, destination: { code: 'LUNA', city: 'Luna Colony', time: '06:00' }, duration: '8h 00m', price: 5500, direct: true },
    { id: 'flight-04', airline: 'Weyland-Yutani Spacelines', airlineLogoUrl: 'https://picsum.photos/seed/airline4/100/100', flightNumber: 'WY-555', origin: { code: 'AEO', city: 'Aeria', time: '01:00' }, destination: { code: 'LV-426', city: 'Acheron', time: '09:00' }, duration: '8h 00m', price: 8500, direct: false },
];

export const restaurants: Restaurant[] = [
    { id: 'food-01', category: 'Restaurants', name: 'The White Dragon Noodle Bar', cuisine: 'Neo-Asian Fusion', rating: 4.8, priceRange: '$$', imageUrl: 'https://picsum.photos/seed/food1/800/600' },
    { id: 'food-02', category: 'Delivery', name: 'Turbo Pizza 3000', cuisine: 'Synth-Italian', rating: 4.2, priceRange: '$', imageUrl: 'https://picsum.photos/seed/food2/800/600' },
    { id: 'food-03', category: 'Restaurants', name: 'Taffey Lewis\'s Bar', cuisine: 'Classic American & Synthahol', rating: 4.5, priceRange: '$$$', imageUrl: 'https://picsum.photos/seed/food3/800/600' },
    { id: 'food-04', category: 'Delivery', name: 'Nutri-Paste Express', cuisine: 'Nutritional Paste', rating: 3.9, priceRange: '$', imageUrl: 'https://picsum.photos/seed/food4/800/600' },
];

export const events: Event[] = [
    { id: 'event-01', category: 'Concerts', name: 'Holographic Idol Fest', location: 'Neo-Shibuya Dome', date: '2099.08.15', price: '150', imageUrl: 'https://picsum.photos/seed/event1/800/600' },
    { id: 'event-02', category: 'Sports', name: 'Zero-G Combat Ball Finals', location: 'Orbital Arena', date: '2099.08.20', price: '250', imageUrl: 'https://picsum.photos/seed/event2/800/600' },
    { id: 'event-03', category: 'Expos', name: 'CyberWare Expo 2099', location: 'MegaCorp Convention Center', date: '2099.09.01', price: '75', imageUrl: 'https://picsum.photos/seed/event3/800/600' },
];

export const venues: Venue[] = [
    { id: 'venue-01', type: 'Spa', name: 'Rejuvenation Matrix', location: 'Sector 4 Wellness Spire', rating: 4.9, services: ['Cryo-Therapy', 'Neural-Relaxation', 'Bio-Sculpting'], imageUrl: 'https://picsum.photos/seed/spa1/800/600' },
    { id: 'venue-02', type: 'Gym', name: 'Goliath Gainz Factory', location: 'Industrial District 9', rating: 4.7, services: ['Grav-Lifting', 'Combat Training', 'Synth-Muscle Implants'], imageUrl: 'https://picsum.photos/seed/gym1/800/600' },
];

export const attractions: Attraction[] = [
    { id: 'local-01', type: 'Attractions', name: 'Museum of Corporate Warfare', location: 'Old Downtown, Sector 1', description: 'Explore the rise and fall of the great megacorporations.', imageUrl: 'https://picsum.photos/seed/local1/800/600' },
    { id: 'local-02', type: 'Tours', name: 'Blade Runner\'s Alley Tour', location: 'Animoid Row, Neo-LA', description: 'Walk the rain-slicked streets of the iconic film.', imageUrl: 'https://picsum.photos/seed/local2/800/600' },
];