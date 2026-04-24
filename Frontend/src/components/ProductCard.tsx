import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  isWishlisted, 
  onToggleWishlist, 
  onAddToCart,
  onClick
}) => {
  // Generate a random rating between 4.0 and 5.0 for display purposes
  // In a real app, this would come from the product data
  const mockRating = 4 + (product.id.charCodeAt(0) % 10) / 10;
  const mockReviewCount = 10 + (product.id.charCodeAt(0) * 3) % 200;

  // Fallback to a seeded picsum image if hoverImage is not defined
  const hoverImageUrl = product.hoverImage || `https://picsum.photos/seed/${product.id}-1/800/1000`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(product)}
      className="group relative flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-bg mb-4">
        {/* Hover Image (Base Layer) */}
        <img 
          src={hoverImageUrl} 
          alt={`${product.name} alternate view`} 
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Default Image (Top Layer, fades out on hover) */}
        <img 
          src={product.image} 
          alt={product.name} 
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-out ${hoverImageUrl !== product.image ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 text-white drop-shadow-md hover:scale-110 transition-transform duration-200"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}`} 
            strokeWidth={1.5}
          />
        </button>
        
        {/* Quick Add Button - Appears on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full py-3.5 bg-brand-text/90 backdrop-blur-sm text-brand-bg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-text transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center text-center px-2">
        <h3 className="text-sm font-medium text-brand-text mb-1.5 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <div className="flex text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-3 h-3 ${star <= Math.round(mockRating) ? 'fill-current' : 'text-brand-border'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-brand-muted">({mockReviewCount})</span>
        </div>

        <div className="text-sm font-bold text-brand-text">{formatPrice(product.price)}</div>
      </div>
    </motion.div>
  );
});
