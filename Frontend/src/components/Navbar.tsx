import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '../config/discounts';
import { formatPrice } from '../utils/format';

interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  autoApply?: boolean;
}

interface NavbarProps {
  wishlistCount: number;
  cartCount: number;
  setView: (view: any) => void;
  selectedCategory: string | null;
  setCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  promotions: Promotion[];
}

export const Navbar: React.FC<NavbarProps> = ({
  wishlistCount,
  cartCount,
  setView,
  selectedCategory,
  setCategory,
  searchQuery,
  setSearchQuery,
  user,
  onLogin,
  onLogout,
  onLogoClick,
  promotions
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);

  const activePromotions = promotions.filter(p => p.active);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (activePromotions.length === 0) return;

    const timer = setInterval(() => {
      setCurrentPromotionIndex((prevIndex) =>
        prevIndex === activePromotions.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [activePromotions.length]);

  const nextPromotion = () => {
    setCurrentPromotionIndex((prevIndex) =>
      prevIndex === activePromotions.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevPromotion = () => {
    setCurrentPromotionIndex((prevIndex) =>
      prevIndex === 0 ? activePromotions.length - 1 : prevIndex - 1
    );
  };

  const categories = [
    { name: 'Bridal Wear', id: 'Bridal Wear' },
    { name: 'Party Wear', id: 'Party Wear' },
    { name: 'Classic Handwork', id: 'Classic Handwork' },
    { name: 'Premium Beads', id: 'Premium Beads' },
    { name: 'Festive Edit', id: 'Festive Edit' },
    { name: 'Designer', id: 'Designer Collection' },
  ];

  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } bg-brand-bg/95 backdrop-blur-md border-b border-brand-border`}
      style={{ zIndex: 50 }}
    >
      {/* Promotional Carousel */}
      {activePromotions.length > 0 ? (
        <div className="bg-brand-text text-brand-bg py-1.5 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-medium tracking-widest uppercase" style={{ zIndex: 49 }}>
          <div className="min-h-6">
            <div className="truncate">
              <span>{activePromotions[currentPromotionIndex].title}</span>
              {activePromotions[currentPromotionIndex].description && (
                <span className="ml-2 text-brand-bg/80">- {activePromotions[currentPromotionIndex].description}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-brand-text text-brand-bg py-1.5 px-4 text-center text-[10px] sm:text-xs font-medium tracking-widest uppercase" style={{ zIndex: 49 }}>
          Free Global Shipping on Orders Over {formatPrice(FREE_SHIPPING_THRESHOLD)} | Shop the New Collection
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Main Header Row */}
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Left Section: Mobile Menu */}
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-brand-muted hover:text-brand-text transition-colors lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center Section: Logo */}
          <div className="shrink-0 flex items-center justify-center flex-1 cursor-pointer" onClick={onLogoClick} role="button" tabIndex={0} aria-label="Go to home page" onKeyDown={(e) => { if (e.key === 'Enter') onLogoClick(); }}>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tighter text-brand-text whitespace-nowrap uppercase">
              fashion<span className="font-sans font-light text-brand-muted text-xl sm:text-2xl ml-1">web</span>
            </h1>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center relative mr-2">
              <Search className="w-4 h-4 text-brand-muted absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-40 xl:w-56 pl-9 pr-4 py-2 text-xs bg-transparent border border-brand-border rounded-full focus:border-brand-text focus:outline-none transition-all text-brand-text placeholder-brand-muted focus:bg-brand-card"
              />
            </div>

            <button
              onClick={() => setView('wishlist')}
              className="p-2 text-brand-muted hover:text-brand-text transition-colors relative"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setView('cart')}
              className="p-2 text-brand-muted hover:text-brand-text transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-text text-[10px] font-bold text-brand-bg">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center pl-2 border-l border-brand-border relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-brand-bg border border-brand-border rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-brand-border mb-2">
                      <p className="text-sm font-medium text-brand-text truncate">{user.name}</p>
                      {user.email && <p className="text-xs text-brand-muted truncate">{user.email}</p>}
                    </div>
                    <button
                      onClick={() => {
                        setView('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-card transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setView('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-card transition-colors"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        setView('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-card transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="hidden sm:block px-4 py-2 text-xs font-medium text-brand-text hover:text-brand-muted transition-colors uppercase tracking-wider"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Desktop Categories Row */}
        <div className="hidden lg:flex justify-center items-center space-x-8 pb-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`text-[11px] xl:text-xs font-medium transition-colors whitespace-nowrap uppercase tracking-[0.15em] pb-1 ${selectedCategory === cat.id ? 'text-brand-text border-b border-brand-text' : 'text-brand-muted hover:text-brand-text'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-brand-bg border-t border-brand-border shadow-xl absolute w-full h-screen overflow-y-auto hide-scrollbar">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for styles..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-brand-card border border-brand-border rounded-md focus:border-brand-text focus:outline-none transition-colors text-brand-text"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Categories</h3>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setIsMobileMenuOpen(false); }}
                  className={`block w-full text-left py-2 text-sm uppercase tracking-wider ${selectedCategory === cat.id ? 'text-brand-text font-bold' : 'text-brand-text hover:text-brand-muted'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-brand-border">
              {!user ? (
                <button
                  onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-brand-text text-brand-bg text-center text-sm font-bold uppercase tracking-widest rounded-md"
                >
                  Sign In / Register
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="block text-sm font-medium text-brand-text">{user.name}</span>
                      {user.email && <span className="block text-xs text-brand-muted">{user.email}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-brand-text hover:text-brand-muted uppercase tracking-wider"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-brand-text hover:text-brand-muted uppercase tracking-wider"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-brand-text hover:text-brand-muted uppercase tracking-wider"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-red-600 hover:text-red-700 uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
