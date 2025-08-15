
import React from 'react';
import { Product } from '../data';

const StarIcon: React.FC<{ className?: string, filled: boolean }> = ({ className, filled }) => (
    <svg className={className} fill={filled ? "#facc15" : "#4b5563"} transform="translate(0, 0)" viewBox="0 0 16.647 16.286" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
    </svg>
);


const ClothingProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [isFavorite, setIsFavorite] = React.useState(false);

    return (
      <div className="font-sans w-full bg-cyber-surface backdrop-blur-xl border border-cyber-border rounded-2xl p-1.5 shadow-lg transition-all duration-500 ease-in-out hover:scale-105 hover:border-cyber-cyan/50 flex flex-col">
        <div className="relative w-full aspect-[4/3] rounded-lg rounded-tr-[3rem] mb-4 flex-shrink-0">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg rounded-tr-[3rem]" />
            <div className="absolute right-2 -bottom-4 bg-cyber-surface border border-cyber-border text-cyber-cyan font-black text-xs px-3 py-1.5 rounded-t-xl rounded-b-2xl shadow-lg">
                ${product.price.toFixed(2)}
            </div>
        </div>

        <label className="absolute top-2 right-2 cursor-pointer">
            <input type="checkbox" className="peer sr-only" checked={isFavorite} onChange={() => setIsFavorite(!isFavorite)} />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-gray-500 peer-checked:fill-red-500 peer-checked:scale-125 peer-checked:animate-bouncing transition-transform duration-300">
                <path d="M12 20a1 1 0 0 1-.437-.1C11.214 19.73 3 15.671 3 9a5 5 0 0 1 8.535-3.536l.465.465.465-.465A5 5 0 0 1 21 9c0 6.646-8.212 10.728-8.562 10.9A1 1 0 0 1 12 20z" />
            </svg>
        </label>

        <div className="px-2 pb-1 flex-1 flex flex-col">
            <div className="font-black text-gray-400 text-xs">CYBER-WEAR</div>
            <div className="font-bold text-white text-sm sm:text-base leading-tight mb-2 min-h-[2.5rem]">{product.name}</div>

            <div className="flex flex-col text-xs uppercase font-bold text-gray-400 gap-2 mb-3">
                <div>
                    <div>Color</div>
                    <ul className="flex flex-wrap items-center gap-1 mt-1">
                        <li className="relative group"><a href="#" className="inline-block w-3.5 h-3.5 border-2 border-cyber-cyan rounded-full"></a><span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10">Ion Blue</span></li>
                        <li className="relative group"><a href="#" className="inline-block w-3.5 h-3.5 border-2 border-white bg-cyber-purple rounded-full"></a><span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10">Synth Purple</span></li>
                        <li className="relative group"><a href="#" className="inline-block w-3.5 h-3.5 border-2 border-cyber-orange rounded-full"></a><span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10">Magma Orange</span></li>
                        <li className="relative group"><a href="#" className="inline-block w-3.5 h-3.5 border-2 border-pink-500 rounded-full"></a><span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10">Neon Pink</span></li>
                    </ul>
                </div>
                <div>
                    <div>Size</div>
                    <ul className="flex items-center mt-1 gap-1">
                        {['XS', 'S', 'M', 'L', 'XL'].map((size, index) => (
                            <li key={size}>
                                <label>
                                    <input type="radio" name={`size-${product.id}`} value={size} className="sr-only peer" defaultChecked={index === 1} />
                                    <span className="h-7 text-xs grid place-content-center text-gray-300 peer-checked:bg-cyber-cyan peer-checked:text-black peer-checked:rounded-t-md peer-checked:rounded-b-sm cursor-pointer px-2.5">{size}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <div className="flex-1"></div>

            <div className="text-gray-400 text-xs font-bold flex items-center gap-2 mb-2">
                <div className="flex">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3.5" filled={i < Math.round(product.rating)} />)}
                </div>
                <span>({product.rating.toFixed(1)})</span>
            </div>
        </div>

        <div className="flex gap-1 px-1 pb-1 mt-auto">
            <button className="flex-auto rounded-tl-2xl rounded-tr-2xl rounded-b-lg border-none py-1.5 bg-cyber-cyan text-black font-black cursor-pointer hover:bg-white transition-colors text-sm sm:text-base">
                <span className="hidden sm:inline">Buy Now</span>
                <span className="sm:hidden">Buy</span>
            </button>
            <button className="w-10 grid place-content-center rounded-tl-2xl rounded-tr-2xl rounded-b-lg border-none py-1.5 bg-cyber-cyan text-black font-black cursor-pointer hover:bg-white transition-colors">
                <svg viewBox="0 0 27.97 25.074" className="w-4 fill-black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,1.175A1.173,1.173,0,0,1,1.175,0H3.4A2.743,2.743,0,0,1,5.882,1.567H26.01A1.958,1.958,0,0,1,27.9,4.035l-2.008,7.459a3.532,3.532,0,0,1-3.4,2.61H8.36l.264,1.4a1.18,1.18,0,0,0,1.156.955H23.9a1.175,1.175,0,0,1,0,2.351H9.78a3.522,3.522,0,0,1-3.462-2.865L3.791,2.669A.39.39,0,0,0,3.4,2.351H1.175A1.173,1.173,0,0,1,0,1.175ZM6.269,22.724a2.351,2.351,0,1,1,2.351,2.351A2.351,2.351,0,0,1,6.269,22.724Zm16.455-2.351a2.351,2.351,0,1,1-2.351,2.351A2.351,2.351,0,0,1,22.724,20.373Z" />
                </svg>
            </button>
        </div>
        <style>{`
            @keyframes bouncing {
                from, to { transform: scale(1, 1); }
                25% { transform: scale(1.25, 1.55); }
                50% { transform: scale(1.55, 1.25); }
                75% { transform: scale(1.25, 1.52); }
            }
            .animate-bouncing {
                animation: bouncing 0.5s;
            }
        `}</style>
      </div>
    );
};

export default ClothingProductCard;
