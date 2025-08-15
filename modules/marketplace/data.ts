
import { MarketplaceSection, MarketplaceL3Section } from './types';

export interface Product {
    id: number;
    name: string;
    category: MarketplaceSection;
    l3category?: MarketplaceL3Section;
    price: number;
    imageUrl: string;
    rating: number;
    brand: string;
    colors: string[];
    stock: number;
}

export const products: Product[] = [
    // Electronics
    { id: 1, name: 'Cybernetic VR Headset', category: 'Electronics', l3category: 'Smartphones', price: 799.99, imageUrl: 'https://picsum.photos/seed/product1/400/300', rating: 4.8, brand: 'NeuroLink', colors: ['#000000', '#FFFFFF'], stock: 50 },
    { id: 6, name: 'Holo-Projector 4K', category: 'Electronics', l3category: 'Laptops', price: 1250.00, imageUrl: 'https://picsum.photos/seed/product6/400/300', rating: 4.7, brand: 'LightWeaver', colors: ['#808080'], stock: 25 },
    { id: 10, name: 'Augmented Reality Glasses', category: 'Electronics', l3category: 'Accessories', price: 550.00, imageUrl: 'https://picsum.photos/seed/product10/400/300', rating: 4.4, brand: 'OptiSys', colors: ['#000000', '#ADD8E6'], stock: 120 },
    { id: 13, name: 'Quantum-Core Laptop', category: 'Electronics', l3category: 'Laptops', price: 2199.00, imageUrl: 'https://picsum.photos/seed/el1/400/300', rating: 4.9, brand: 'NeuroLink', colors: ['#808080'], stock: 40 },
    { id: 14, name: 'Chrono-Lock Smartwatch', category: 'Electronics', l3category: 'Accessories', price: 349.99, imageUrl: 'https://picsum.photos/seed/el2/400/300', rating: 4.6, brand: 'TimeWarp', colors: ['#000000', '#FFD700'], stock: 200 },
    { id: 15, name: 'Noise-Cancelling Sonic Pods', category: 'Electronics', l3category: 'Accessories', price: 199.00, imageUrl: 'https://picsum.photos/seed/el3/400/300', rating: 4.8, brand: 'AudioPhaze', colors: ['#FFFFFF', '#000000'], stock: 500 },
    { id: 16, name: 'Cyber-Sentinel Drone', category: 'Electronics', l3category: 'Smartphones', price: 899.00, imageUrl: 'https://picsum.photos/seed/el4/400/300', rating: 4.5, brand: 'OmniVision', colors: ['#000000'], stock: 75 },

    // Clothing
    { id: 2, name: 'Zero-G Bomber Jacket', category: 'Clothing', l3category: 'Men', price: 249.50, imageUrl: 'https://picsum.photos/seed/product2/400/300', rating: 4.5, brand: 'AeroWear', colors: ['#000000', '#808080'], stock: 150 },
    { id: 7, name: 'Smart-Fabric T-Shirt', category: 'Clothing', l3category: 'Women', price: 75.00, imageUrl: 'https://picsum.photos/seed/product7/400/300', rating: 4.3, brand: 'SynthTex', colors: ['#FFFFFF', '#0000FF'], stock: 300 },
    { id: 11, name: 'LED Reactive Sneakers', category: 'Clothing', l3category: 'Kids', price: 180.00, imageUrl: 'https://picsum.photos/seed/product11/400/300', rating: 4.6, brand: 'LightStep', colors: ['#FFFFFF', '#00FF00'], stock: 250 },
    { id: 17, name: 'Cargo-Tech Pants', category: 'Clothing', l3category: 'Men', price: 120.00, imageUrl: 'https://picsum.photos/seed/c1/400/300', rating: 4.4, brand: 'AeroWear', colors: ['#808080', '#000000'], stock: 180 },

    // Books
    { id: 3, name: 'Neuromancer (First Edition)', category: 'Books', l3category: 'Fiction', price: 120.00, imageUrl: 'https://picsum.photos/seed/product3/400/300', rating: 4.9, brand: 'Penguin', colors: [], stock: 10 },
    { id: 8, name: 'The Art of Cyber-Warfare', category: 'Books', l3category: 'Educational', price: 45.50, imageUrl: 'https://picsum.photos/seed/product8/400/300', rating: 4.6, brand: 'O\'Reilly', colors: [], stock: 100 },
    { id: 12, name: 'Classic Sci-Fi Anthology', category: 'Books', l3category: 'Fiction', price: 29.99, imageUrl: 'https://picsum.photos/seed/product12/400/300', rating: 4.8, brand: 'Tor Books', colors: [], stock: 200 },
    
    // Home & Garden
    { id: 4, name: 'Hydroponic Garden Kit', category: 'Home & Garden', l3category: 'Garden', price: 89.99, imageUrl: 'https://picsum.photos/seed/product4/400/300', rating: 4.2, brand: 'GreenThumb', colors: ['#FFFFFF'], stock: 90 },
    { id: 9, name: 'Auto-Cleaning Window Bot', category: 'Home & Garden', l3category: 'Furniture', price: 320.00, imageUrl: 'https://picsum.photos/seed/product9/400/300', rating: 4.1, brand: 'CleanSweep', colors: ['#FFFFFF'], stock: 60 },

    // Deals
    { id: 5, name: 'G-Flash Drone (Refurb)', category: 'Deals', l3category: 'Daily Deals', price: 199.99, imageUrl: 'https://picsum.photos/seed/product5/400/300', rating: 4.0, brand: 'OmniVision', colors: ['#808080'], stock: 30 },
];
