import React from 'react';

// Import types from the parent module to ensure consistency
import type { MarketplaceSection } from '../types';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  l3category?: string;
}

export interface Filters {
  price: string;
  brands: string[];
  color: string;
  search?: string;
}

interface FilterBarProps {
  products: Product[];
  activeFilters: Filters;
  onFilterChange: (filters: Filters) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  products, 
  activeFilters, 
  onFilterChange, 
  className = '' 
}) => {
  const handlePriceChange = (price: string) => {
    onFilterChange({ ...activeFilters, price });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const brands = checked 
      ? [...activeFilters.brands, brand]
      : activeFilters.brands.filter(b => b !== brand);
    onFilterChange({ ...activeFilters, brands });
  };

  const handleColorChange = (color: string) => {
    onFilterChange({ ...activeFilters, color });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...activeFilters, search });
  };

  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.category)));
  
  // Get price range from products
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 1000 };

  return (
    <div className={`filter-bar p-2 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search Filter */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <label className="text-sm text-gray-300">Search:</label>
          <input
            type="text"
            value={activeFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
        {/* Price Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Price:</label>
          <select
            value={activeFilters.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">All Prices</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200+">$200+</option>
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Category:</label>
          <select
            value={activeFilters.brands[0] || ''}
            onChange={(e) => handleBrandChange(e.target.value, true)}
            className="px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">All Categories</option>
            {availableBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Sort:</label>
          <select
            value={activeFilters.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFilterChange({ price: '', brands: [], color: '', search: '' })}
          className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
