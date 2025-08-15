
import React, { useMemo } from 'react';
import { Product } from '../data';
import { Filters } from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ClothingProductCard from '../components/ClothingProductCard';

interface BrowseProps {
    baseProducts: Product[];
    filters: Filters;
}

const Browse: React.FC<BrowseProps> = ({ baseProducts, filters }) => {
    const productsToShow = useMemo(() => {
        return baseProducts.filter(p => {
            // Search filter
            if (filters.search && filters.search.trim()) {
                const searchTerm = filters.search.toLowerCase();
                const matchesName = p.name.toLowerCase().includes(searchTerm);
                const matchesCategory = p.category.toLowerCase().includes(searchTerm);
                const matchesBrand = p.brand.toLowerCase().includes(searchTerm);
                if (!matchesName && !matchesCategory && !matchesBrand) {
                    return false;
                }
            }
            
            // Price filter
            if (filters.price) {
                if (filters.price === '200+') {
                    if (p.price < 200) return false;
                } else {
                    const [min, max] = filters.price.split('-').map(Number);
                    if (p.price < min || p.price > max) return false;
                }
            }
            
            // Brand/Category filter
            if (filters.brands.length > 0 && !filters.brands.includes(p.category)) {
                return false;
            }
            
            // Sort/Color filter (repurposed as sort)
            // This will be handled after filtering
            
            return true;
        }).sort((a, b) => {
            // Apply sorting based on color filter (repurposed as sort)
            switch (filters.color) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return b.id - a.id; // Assuming higher ID means newer
                default:
                    return 0; // Default order
            }
        });
    }, [baseProducts, filters]);


    return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 overflow-y-auto pr-1 pb-1">
            {productsToShow.length > 0 ? (
                productsToShow.map((product) => {
                    if (product.category === 'Clothing') {
                        return <ClothingProductCard key={product.id} product={product} />;
                    }
                    return <ProductCard key={product.id} product={product} />;
                })
            ) : (
                <div className="col-span-full flex items-center justify-center text-gray-500 h-full">
                    <p>No products match your current filters.</p>
                </div>
            )}
        </div>
    );
};

export default Browse;
