
import React from 'react';
import GlassCard from '../../../components/GlassCard';
import { Product } from '../data';

interface ProductCardProps {
    product: Product;
}

const StarIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527a.99.99 0 00-.282.79l1.172 5.273c.275 1.242-.972 2.204-2.064 1.583l-4.832-2.89a.99.99 0 00-.928 0l-4.832 2.89c-1.092.62-2.339-.341-2.064-1.583l1.172-5.273a.99.99 0 00-.282-.79L.165 11.042c-.887-.76-.415-2.212.749-2.305l5.404-.433L8.4 3.21z" clipRule="evenodd" />
    </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <GlassCard className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-cyber-cyan/50 hover:shadow-glow-cyan">
            <div className="aspect-video bg-black/20 overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-cyber-cyan transition-colors">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                <div className="flex-1"></div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xl sm:text-2xl font-mono font-bold text-white">${product.price.toFixed(2)}</p>
                    <button className="text-sm sm:text-base font-bold text-cyber-bg bg-cyber-cyan px-4 py-2 rounded-lg hover:bg-white transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export default ProductCard;
