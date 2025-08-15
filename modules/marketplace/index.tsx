
import React, { useState, useMemo, useEffect } from 'react';
import { MarketplaceSection, MarketplaceL3Section } from './types';
import Browse from './sections/Browse';
import { MarketplaceL2Sidebar, FilterBar } from './components';
import { MARKETPLACE_L3_MAP } from '../../constants';
import { products } from './data';

interface MarketplaceProps {
    activeSection: MarketplaceSection; // This is L2
}

import type { Filters } from './components/FilterBar';

const Marketplace: React.FC<MarketplaceProps> = ({ activeSection: activeL2Section }) => {
    const l3NavItems = useMemo(() => MARKETPLACE_L3_MAP[activeL2Section] || [], [activeL2Section]);
    const [activeL3Section, setActiveL3Section] = useState<MarketplaceL3Section | null>(null);
    const [filters, setFilters] = useState<Filters>({ price: '', brands: [], color: '', search: '' });

    useEffect(() => {
        // When the L2 section changes, reset L3 and filters
        const firstL3 = l3NavItems.length > 0 ? l3NavItems[0] as MarketplaceL3Section : null;
        setActiveL3Section(firstL3);
        setFilters({ price: '', brands: [], color: '', search: '' });
    }, [activeL2Section, l3NavItems]);

    useEffect(() => {
        // When L3 changes, reset filters
        setFilters({ price: '', brands: [], color: '', search: '' });
    }, [activeL3Section]);

    const title = activeL3Section || (activeL2Section === 'All' ? 'Featured Products' : activeL2Section);
    const description = `Discover and purchase goods from our curated collection of ${activeL2Section}. Now showing: ${activeL3Section || 'All'}`;

    const productsForCurrentView = useMemo(() => {
        let filtered = products;
        if (activeL2Section !== 'All') {
            filtered = filtered.filter(p => p.category === activeL2Section);
        }
        if (activeL3Section) {
            if (activeL2Section === 'All') {
                if (activeL3Section === 'Featured') return products.filter(p => [1, 6, 11, 4].includes(p.id));
                if (activeL3Section === 'New Arrivals') return products.filter(p => p.id > 10);
                if (activeL3Section === 'Popular') return products.filter(p => p.rating > 4.5);
                return products;
            }
            return filtered.filter(p => p.l3category === activeL3Section);
        }
        return filtered;
    }, [activeL2Section, activeL3Section]);


    return (
        <div className="h-full flex text-white overflow-hidden">
            <MarketplaceL2Sidebar
                activeL2Section={activeL2Section}
                activeL3Section={activeL3Section}
                setActiveL3Section={setActiveL3Section}
            />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto min-w-0 flex flex-col gap-2">
                <div>
                    <h2 className="text-3xl font-bold text-white">{title as string}</h2>
                    <p className="text-gray-400">{description}</p>
                </div>

                <FilterBar
                    products={productsForCurrentView}
                    activeFilters={filters}
                    onFilterChange={setFilters}
                />

                <div className="h-full flex flex-col gap-2 animate-fade-in flex-1 min-h-0">
                    <Browse
                        baseProducts={productsForCurrentView}
                        filters={filters}
                    />
                </div>
            </main>
        </div>
    );
};

export default Marketplace;
