
import React from 'react';
import { ShoppingBag, EyeOff } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  // Check if product is available (default to true if undefined for backward compatibility)
  const isAvailable = product.isAvailable !== false;

  return (
    <div className="group relative flex flex-col items-center">
      {/* Card Background Glow Effect - Only if available */}
      {isAvailable && (
          <div className={`absolute inset-0 bg-gradient-to-br ${product.bgColor} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-3xl`} />
      )}
      
      {/* Main Card */}
      <div 
        className={`relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-800 border border-slate-700/50 shadow-lg transition-all duration-300 ${isAvailable ? 'group-hover:shadow-teal-900/20 group-hover:border-teal-500/30 group-hover:-translate-y-1 cursor-pointer' : 'cursor-not-allowed opacity-75'}`} 
        onClick={() => isAvailable && onAdd(product)}
      >
        
        {/* Background Gradient for visual appeal */}
        <div className={`absolute inset-0 bg-gradient-to-br ${product.bgColor} opacity-10`} />
        
        {/* Product Image - Grayscale if unavailable */}
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-110' : 'grayscale'}`}
          loading="lazy"
        />

        {/* Unavailable Overlay */}
        {!isAvailable && (
             <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center backdrop-grayscale">
                 <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-1.5 rounded-full text-xs font-bold transform -rotate-12 flex items-center gap-1 shadow-lg backdrop-blur-sm">
                    <EyeOff size={14} />
                    <span>غير متاح</span>
                 </div>
             </div>
        )}

        {/* Overlay on hover - Only if available */}
        {isAvailable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-teal-500 hover:border-teal-500 transition-all transform scale-0 group-hover:scale-100 duration-300"
                >
                    <ShoppingBag size={24} />
                </button>
            </div>
        )}
        
        {/* Flash Tag - Only if available and needed */}
        {isAvailable && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                فوري
            </div>
        )}
      </div>

      <h3 className={`text-sm font-bold text-center transition-colors ${isAvailable ? 'text-slate-200 group-hover:text-teal-400' : 'text-slate-500'}`}>
        {product.name}
      </h3>
    </div>
  );
};

export default ProductCard;
