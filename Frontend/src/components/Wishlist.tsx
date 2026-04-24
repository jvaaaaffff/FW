import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface WishlistProps {
  wishlistItems: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  setView: (view: 'home' | 'wishlist' | 'cart' | 'product') => void;
  onProductClick: (product: Product) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ 
  wishlistItems, 
  onToggleWishlist, 
  onAddToCart,
  setView,
  onProductClick
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      <h2 className="text-3xl font-serif font-bold text-brand-text mb-8">Your Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-brand-bg rounded-2xl border border-brand-border">
          <div className="w-20 h-20 bg-brand-card rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-brand-text mb-2">Your wishlist is empty</h3>
          <p className="text-brand-muted mb-8 text-center max-w-md">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <button 
            onClick={() => setView('home')}
            className="px-8 py-3 bg-brand-accent text-white rounded-full font-medium hover:bg-brand-accent-hover transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
