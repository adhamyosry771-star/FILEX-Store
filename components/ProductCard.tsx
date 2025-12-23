
import React from 'react';
import { ShoppingBag, EyeOff } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const isAvailable = product.isAvailable !== false;

  return (
    <div className="group relative flex flex-col items-center w-full transform-gpu">
      {/* Glow Effect */}
      {isAvailable && (
          <div className={`absolute inset-0 bg-gradient-to-br ${product.bgColor} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500 rounded-3xl`} />
      )}
      
      {/* Main Card */}
      <div 
        className={`relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-slate-800 border border-slate-700/50 shadow-md transition-all duration-300 ${isAvailable ? 'group-hover:shadow-teal-900/10 group-hover:border-teal-500/30 group-hover:-translate-y-1 cursor-pointer' : 'cursor-not-allowed opacity-70'}`} 
        onClick={() => isAvailable && onAdd(product)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${product.bgColor} opacity-5`} />
        
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
          loading="lazy"
        />

        {!isAvailable && (
             <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                 <div className="bg-red-500/20 border border-red-500 text-red-100 px-3 py-1 rounded-full text-[9px] font-bold transform -rotate-12 shadow-lg flex items-center gap-1">
                    <EyeOff size={10} />
                    <span>غير متاح</span>
                 </div>
             </div>
        )}

        {isAvailable && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-teal-500 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-xl">
                    <ShoppingBag size={18} />
                </button>
            </div>
        )}
        
        {isAvailable && (
            <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <div className="w-1 rounded-full bg-green-500 animate-pulse h-1"></div>
                فوري
            </div>
        )}
      </div>

      <h3 className={`text-[11px] md:text-sm font-bold text-center transition-colors line-clamp-1 px-1 ${isAvailable ? 'text-slate-200 group-hover:text-teal-400' : 'text-slate-500'}`}>
        {product.name}
      </h3>
    </div>
  );
};

export default ProductCard;
