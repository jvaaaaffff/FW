// Local storage management for cart and wishlist
import { Product } from '../types';

const CART_STORAGE_KEY = 'fashion_cart';
const WISHLIST_STORAGE_KEY = 'fashion_wishlist';

export const localStorageUtils = {
  // Cart functions
  getCart: (): Product[] => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setCart: (products: Product[]): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Silent localStorage failure
    }
  },

  addToCart: (product: Product, quantity: number = 1): Product[] => {
    const cart = localStorageUtils.getCart();
    const newItems = Array(quantity).fill(product);
    const updated = [...cart, ...newItems];
    localStorageUtils.setCart(updated);
    return updated;
  },

  removeFromCart: (index: number): Product[] => {
    const cart = localStorageUtils.getCart();
    const updated = cart.filter((_, i) => i !== index);
    localStorageUtils.setCart(updated);
    return updated;
  },

  clearCart: (): void => {
    localStorage.removeItem(CART_STORAGE_KEY);
  },

  // Wishlist functions
  getWishlist: (): Product[] => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setWishlist: (products: Product[]): void => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Silent localStorage failure
    }
  },

  toggleWishlist: (product: Product): Product[] => {
    const wishlist = localStorageUtils.getWishlist();
    const isWishlisted = wishlist.some(item => item.id === product.id);
    const updated = isWishlisted
      ? wishlist.filter(item => item.id !== product.id)
      : [...wishlist, product];
    localStorageUtils.setWishlist(updated);
    return updated;
  },

  clearWishlist: (): void => {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  },

  // Get only product IDs
  getCartIds: (): string[] => {
    return localStorageUtils.getCart().map(p => p.id);
  },

  getWishlistIds: (): string[] => {
    return localStorageUtils.getWishlist().map(p => p.id);
  },

  // Clear all
  clearAll: (): void => {
    localStorageUtils.clearCart();
    localStorageUtils.clearWishlist();
  },
};
