/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProductCard } from "./components/ProductCard";
import { HeroSlider } from "./components/HeroSlider";
import { OfferCarousel } from "./components/OfferCarousel";
import { LoginModal } from "./components/LoginModal";
import { CookieConsent } from "./components/CookieConsent";
import { OfflineLoader } from "./components/OfflineLoader";
import { products } from "./data/products";
import { Product } from "./types";
import { formatPrice } from "./utils/format";
import { localStorageUtils } from "./utils/localStorage";
import { Filter, Trash2, Heart } from "lucide-react";
// import { usePerformance } from "./hooks/usePerformance";

// Lazy load heavy components
const Wishlist = lazy(() => import("./components/Wishlist").then(module => ({ default: module.Wishlist })));
const ProductDetail = lazy(() => import("./components/ProductDetail").then(module => ({ default: module.ProductDetail })));
const Checkout = lazy(() => import("./components/Checkout").then(module => ({ default: module.Checkout })));
const FilterSidebar = lazy(() => import("./components/FilterSidebar").then(module => ({ default: module.FilterSidebar })));
const Profile = lazy(() => import("./components/Profile").then(module => ({ default: module.Profile })));
const TrackOrder = lazy(() => import("./components/TrackOrder").then(module => ({ default: module.TrackOrder })));
const FAQs = lazy(() => import("./components/FAQs").then(module => ({ default: module.FAQs })));
const SizeGuide = lazy(() => import("./components/SizeGuide").then(module => ({ default: module.SizeGuide })));
const Returns = lazy(() => import("./components/Returns").then(module => ({ default: module.Returns })));
const About = lazy(() => import("./components/About").then(module => ({ default: module.About })));
const Contact = lazy(() => import("./components/Contact").then(module => ({ default: module.Contact })));

interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  autoApply?: boolean;
}

interface DiscountCode {
  code: string;
  title: string;
  description: string;
  type: string;
  percentage?: number;
  amount?: number;
  minSpend?: number;
  buyCount?: number;
  getFreeCount?: number;
  shippingDiscount?: boolean;
  autoApply?: boolean;
  active: boolean;
}

interface AppliedCoupon {
  code: string;
  title: string;
  description: string;
  amount: number;
  shippingDiscount?: boolean;
}

export interface CustomUser {
  _id: string;
  name: string;
  surname?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  avatarUrl?: string;
  role: string;
  token?: string;
}

export default function App() {
  // usePerformance('App');
  const [view, setView] = useState<
    | "home"
    | "category"
    | "wishlist"
    | "cart"
    | "product"
    | "checkout"
    | "profile"
    | "order-confirmation"
    | "track-order"
    | "faqs"
    | "size-guide"
    | "returns"
    | "about"
    | "contact"
  >("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc">("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>(() => localStorageUtils.getWishlist());
  const [cart, setCart] = useState<Product[]>(() => localStorageUtils.getCart());
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>(products);
  const [landingPromotions, setLandingPromotions] = useState<Promotion[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [ignoredCouponCode, setIgnoredCouponCode] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isNetworkSlow, setIsNetworkSlow] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await fetch('/api/health');
      } catch {
        // Silent failure during backend health check.
      }
    };
    checkBackend();

    // Fetch promotions and discount codes on initial load
    fetchLandingData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorageUtils.setCart(cart);
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorageUtils.setWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    const fetchProducts = async () => {
      const slowNetworkTimer = window.setTimeout(() => {
        setIsNetworkSlow(true);
      }, 600);

      try {
        const queryUrl = buildProductQuery();
        const res = await fetch(queryUrl);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicProducts(data.data);
        } else {
          setDynamicProducts(products); // fallback to local data
        }
      } catch {
        setDynamicProducts(products); // fallback
      } finally {
        window.clearTimeout(slowNetworkTimer);
        setIsNetworkSlow(false);
        setIsLoadingProducts(false);
      }
    };

    // Fetch landing data on initial load
    if (view === 'home') {
      fetchLandingData();
    }

    fetchProducts();
  }, [selectedCategory, debouncedSearchQuery, sortOption, priceRange, selectedColors, selectedMaterials, currentPage, view]);

  // Get all possible categories and base available options
  const availableCategories = Array.from(
    new Set(dynamicProducts.map((p) => p.category).filter(Boolean)),
  ) as string[];

  const filteredProducts = React.useMemo(() => {
    const filtered = dynamicProducts.filter((p) => {
      const matchesCategory = selectedCategory
        ? p.category === selectedCategory
        : true;
      const matchesSearch =
        p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesColor =
        selectedColors.length === 0 ||
        (p.color && selectedColors.includes(p.color));
      const matchesMaterial =
        selectedMaterials.length === 0 ||
        (p.material && selectedMaterials.includes(p.material));
      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesColor &&
        matchesMaterial
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0; // "featured" or default
      }
    });
  }, [dynamicProducts, selectedCategory, debouncedSearchQuery, priceRange, selectedColors, selectedMaterials, sortOption]);

  // Calculate available colors and materials based on filtered products
  // This shows only options that are relevant to current selections
  const availableColors = Array.from(
    new Set(
      filteredProducts
        .filter(p => !selectedColors.length || selectedColors.some(c => c === p.color || !p.color))
        .map(p => p.color)
        .filter(Boolean)
    ),
  ) as string[];

  const availableMaterials = Array.from(
    new Set(
      filteredProducts
        .filter(p => !selectedMaterials.length || selectedMaterials.some(m => m === p.material || !p.material))
        .map(p => p.material)
        .filter(Boolean)
    ),
  ) as string[];

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data);

            // Merge localStorage data with server data
            const serverWishlistIds = new Set(data.data.wishlist || []);
            const serverCartIds = data.data.cart || [];

            const localWishlistIds = localStorageUtils.getWishlistIds();
            const localCartIds = localStorageUtils.getCartIds();

            // Merge wishlist IDs (union of local and server)
            const mergedWishlistIds = Array.from(new Set([...serverWishlistIds, ...localWishlistIds]));
            // Merge cart IDs - preserve order and count from local first, then add server items
            const mergedCartIds = [...localCartIds, ...serverCartIds.filter((id: string) => !localCartIds.includes(id))];

            // Map IDs to products
            const mergedWishlist = dynamicProducts.filter((p) => mergedWishlistIds.includes(p.id));
            const mergedCart = mergedCartIds
              .map((id: string) => dynamicProducts.find((p) => p.id === id))
              .filter(Boolean) as Product[];

            // Update state
            setWishlist(mergedWishlist);
            setCart(mergedCart);

            // Sync merged data back to server
            try {
              const token = localStorage.getItem('token');
              await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  wishlist: mergedWishlistIds,
                  cart: mergedCartIds,
                })
              });
            } catch {
              // Silent sync failure is handled by fallback local storage.
            }
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsAuthReady(true);
    };

    if (dynamicProducts.length > 0) {
      checkAuth();
    }
  }, [dynamicProducts]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  // Show login modal on initial visit if not logged in
  useEffect(() => {
    if (isAuthReady && !user) {
      const hasPrompted = sessionStorage.getItem("hasPromptedLogin");
      if (!hasPrompted) {
        setLoginMessage("Sign in to access your wishlist, track orders, and experience seamless checkout.");
        setShowLoginModal(true);
        sessionStorage.setItem("hasPromptedLogin", "true");
      }
    }
  }, [isAuthReady, user]);

  const syncToDatabase = async (
    newWishlist: Product[],
    newCart: Product[],
  ) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            wishlist: newWishlist.map((p) => p.id),
            cart: newCart.map((p) => p.id),
          })
        });
      } catch {
        // Sync failures are silent; state is still updated locally.
      }
    }
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const isWishlisted = prev.some((item) => item.id === product.id);
      const newWishlist = isWishlisted
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product];

      syncToDatabase(newWishlist, cart);
      return newWishlist;
    });
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const newItems = Array(quantity).fill(product);
      const newCart = [...prev, ...newItems];
      syncToDatabase(wishlist, newCart);
      return newCart;
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const handleRemoveFromCart = (indexToRemove: number) => {
    setCart((prev) => {
      const newCart = prev.filter((_, index) => index !== indexToRemove);
      syncToDatabase(wishlist, newCart);
      return newCart;
    });
  };

  const handleMoveToWishlist = (product: Product, indexToRemove: number) => {
    handleRemoveFromCart(indexToRemove);
    if (!wishlist.some(item => item.id === product.id)) {
      handleToggleWishlist(product);
    }
    showToast(`Moved ${product.name} to wishlist`, 'info');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (userData: CustomUser) => {
    setUser(userData);
    setShowLoginModal(false);
    showToast('Signed in successfully', 'success');

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    // Keep cart and wishlist in localStorage for guest browsing
    // Cart and wishlist will be preserved through localStorage persistence
    setView("home");
    showToast("Logged out successfully. Your cart is saved.", 'info');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchQuery, priceRange, selectedColors, selectedMaterials, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Calculate Discount
  const calculateDiscount = () => {
    let discountAmount = 0;
    let shippingDiscount = false;

    // Auto-apply discounts
    const autoDiscounts = discountCodes.filter(d => d.autoApply && d.active);
    for (const discount of autoDiscounts) {
      if (discount.type === 'percentage' && discount.minSpend && cartSubtotal >= discount.minSpend) {
        discountAmount += Math.floor((cartSubtotal * (discount.percentage ?? 0)) / 100);
      } else if (discount.type === 'shipping' && discount.minSpend && cartSubtotal >= discount.minSpend) {
        shippingDiscount = true;
      }
    }

    // Manual coupon discount
    if (appliedCoupon) {
      discountAmount += appliedCoupon.amount;
      if (appliedCoupon.shippingDiscount) {
        shippingDiscount = true;
      }
    }

    return { discountAmount, shippingDiscount };
  };

  const { discountAmount, shippingDiscount } = calculateDiscount();
  const cartTotal = cartSubtotal - discountAmount;

  // Build product query URL with filters
  const buildProductQuery = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
    if (sortOption !== 'featured') params.append('sort', sortOption);
    if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
    if (priceRange[1] < 1000) params.append('maxPrice', priceRange[1].toString());
    if (selectedColors.length > 0) params.append('colors', selectedColors.join(','));
    if (selectedMaterials.length > 0) params.append('materials', selectedMaterials.join(','));
    params.append('page', currentPage.toString());
    params.append('limit', itemsPerPage.toString());
    return `/api/products?${params.toString()}`;
  };

  // Fetch landing data (promotions and trending products)
  const fetchLandingData = async () => {
    try {
      const [promotionsRes, trendingRes] = await Promise.all([
        fetch('/api/promotions'),
        fetch('/api/products/trending')
      ]);

      if (promotionsRes.ok) {
        const promotionsData = await promotionsRes.json();
        if (promotionsData.success) {
          setLandingPromotions(promotionsData.data.promotions || []);
          setDiscountCodes(promotionsData.data.discountCodes || []);
        }
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        if (trendingData.success && Array.isArray(trendingData.data)) {
          // Update trending products in the home view
          setDynamicProducts(prev => {
            const trendingIds = trendingData.data.map((p: Product) => p.id);
            const nonTrending = prev.filter(p => !trendingIds.includes(p.id));
            return [...trendingData.data, ...nonTrending];
          });
        }
      }
    } catch {
      // Landing data fetch failures are silent.
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-text flex flex-col">
      <Navbar
        wishlistCount={wishlist.length}
        cartCount={cart.length}
        setView={setView}
        selectedCategory={selectedCategory}
        setCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery("");
          setView("category");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query);
          setView("category");
        }}
        user={user}
        onLogin={() => {
          setLoginMessage("Sign in to access your account.");
          setShowLoginModal(true);
        }}
        onLogout={handleLogout}
        onLogoClick={() => {
          setSelectedCategory(null);
          setSearchQuery("");
          setView("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        promotions={landingPromotions}
      />

      <OfflineLoader />
      <main className="grow pt-20 sm:pt-24 lg:pt-32">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <HeroSlider
                onShopNow={() => {
                  setSelectedCategory(null);
                  setView("category");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onBridalCollection={() => {
                  setSelectedCategory("Bridal Wear");
                  setView("category");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />

              <OfferCarousel promotions={landingPromotions} />

              {/* Shop by Category Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-brand-border">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-text mb-3">
                    Shop by Category
                  </h2>
                  <div className="w-16 h-0.5 bg-brand-accent mx-auto"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                  {[
                    {
                      name: "Bridal Wear",
                      id: "Bridal Wear",
                      img: "https://images.cbazaar.com/images/purple-silk-embroidered-sequins-saree-sasck4304a-u.jpg",
                    },
                    {
                      name: "Party Wear",
                      id: "Party Wear",
                      img: "https://images.cbazaar.com/images/teal-blue-faux-chiffon-stones-saree--sassd13008-u.jpg",
                    },
                    {
                      name: "Classic Handwork",
                      id: "Classic Handwork",
                      img: "https://images.cbazaar.com/images/rani-pink-rangoli-silk-embroidered-sequins-zari-saree-sassd08008-u.jpg",
                    },
                    {
                      name: "Premium Beads",
                      id: "Premium Beads",
                      img: "https://images.cbazaar.com/images/bottle-green-banarasi-silk-zari-woven-saree-saske6004-u.jpg",
                    },
                    {
                      name: "Festive Edit",
                      id: "Festive Edit",
                      img: "https://images.cbazaar.com/images/red-georgette-embroidered-saree-sasaca5962-u.jpg",
                    },
                    {
                      name: "Designer",
                      id: "Designer Collection",
                      img: "https://images.cbazaar.com/images/peach-net-sequins-embroidered-saree-sashe352-u.jpg",
                    },
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setView("category");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-3/4 rounded-t-full overflow-hidden mb-4 relative border border-brand-border p-1">
                        <div className="w-full h-full rounded-t-full overflow-hidden relative">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                      </div>
                      <h3 className="text-[11px] sm:text-xs font-bold text-brand-text uppercase tracking-widest text-center group-hover:text-brand-accent transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Now Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-text mb-3">
                    Trending Now
                  </h2>
                  <div className="w-16 h-0.5 bg-brand-accent mx-auto mb-4"></div>
                  <p className="text-brand-muted text-sm uppercase tracking-widest">
                    Our most popular pieces this week
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {dynamicProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlist.some(
                        (item) => item.id === product.id,
                      )}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onClick={handleProductClick}
                    />
                  ))}
                </motion.div>

                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setView("category");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-block px-10 py-3 border border-brand-text text-brand-text text-xs font-bold uppercase tracking-widest hover:bg-brand-text hover:text-brand-bg transition-colors duration-300"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Product Grid */}
              <div
                id="product-grid"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pt-8 sm:pb-24"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-text">
                      {selectedCategory || "Our Collection"}
                    </h2>
                    <p className="mt-2 text-brand-muted">
                      {selectedCategory
                        ? `Exploring our ${selectedCategory} collection.`
                        : "Discover our full range of products."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsFilterOpen(true)}
                      className="lg:hidden flex items-center gap-2 text-sm font-medium text-brand-text hover:text-brand-muted transition-colors border border-brand-border px-4 py-2 rounded-sm"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-sm font-medium text-brand-text hover:text-brand-muted transition-colors border-b border-brand-text pb-1"
                      >
                        Clear Category
                      </button>
                    )}
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="text-sm font-medium text-brand-text bg-transparent border border-brand-border px-4 py-2 rounded-sm focus:outline-none focus:border-brand-text"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  <Suspense fallback={<div className="w-full lg:w-80 h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div></div>}>
                    <FilterSidebar
                      isOpen={isFilterOpen}
                      onClose={() => setIsFilterOpen(false)}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      selectedColors={selectedColors}
                      setSelectedColors={setSelectedColors}
                      selectedMaterials={selectedMaterials}
                      setSelectedMaterials={setSelectedMaterials}
                      availableColors={availableColors}
                      availableMaterials={availableMaterials}
                      availableCategories={availableCategories}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />
                  </Suspense>

                  <div className="flex-1">
                    {isLoadingProducts ? (
                      <div className="rounded-3xl border border-brand-border bg-white/80 p-10 text-center shadow-sm">
                        <div className="mb-4 text-lg font-semibold text-brand-text">Loading products...</div>
                        {isNetworkSlow ? (
                          <p className="text-sm text-brand-muted">This is taking longer than usual. Please wait while we load your items.</p>
                        ) : (
                          <p className="text-sm text-brand-muted">Fetching the latest collection for you.</p>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                      >
                        {paginatedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isWishlisted={wishlist.some(
                              (item) => item.id === product.id,
                            )}
                            onToggleWishlist={handleToggleWishlist}
                            onAddToCart={handleAddToCart}
                            onClick={handleProductClick}
                          />
                        ))}
                      </motion.div>
                    )}

                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-brand-border text-brand-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-text hover:text-brand-bg transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-10 h-10 flex items-center justify-center border ${currentPage === i + 1
                                ? "bg-brand-text text-brand-bg border-brand-text"
                                : "border-brand-border text-brand-text hover:bg-brand-text/10"
                                } transition-colors`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-brand-border text-brand-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-text hover:text-brand-bg transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-20">
                        <p className="text-brand-muted text-lg">
                          No products found matching your criteria.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedCategory(null);
                            setPriceRange([0, 1000]);
                            setSelectedColors([]);
                            setSelectedMaterials([]);
                          }}
                          className="mt-4 text-brand-text font-medium hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === "product" && selectedProduct && (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <ProductDetail
                  product={selectedProduct}
                  isWishlisted={wishlist.some(
                    (item) => item.id === selectedProduct.id,
                  )}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(product, quantity) =>
                    handleAddToCart(product, quantity)
                  }
                  onBack={() => setView("home")}
                  onProductClick={handleProductClick}
                  allProducts={dynamicProducts}
                />
              </Suspense>
            </motion.div>
          )}

          {view === "wishlist" && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <Wishlist
                  wishlistItems={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  setView={setView}
                  onProductClick={handleProductClick}
                />
              </Suspense>
            </motion.div>
          )}

          {view === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]"
            >
              <h2 className="text-3xl font-serif font-bold text-brand-text mb-8">
                Your Cart
              </h2>
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-brand-bg rounded-2xl border border-brand-border">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">
                    Your cart is empty
                  </h3>
                  <button
                    onClick={() => setView("home")}
                    className="mt-6 px-8 py-3 bg-brand-accent text-white rounded-full font-medium hover:bg-brand-accent-hover transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
                  <p className="text-brand-muted mb-6">
                    You have {cart.length} items in your cart.
                  </p>
                  <div className="space-y-6">
                    {(Object.values(
                      cart.reduce((acc, product) => {
                        if (!acc[product.id]) {
                          acc[product.id] = { product, quantity: 0, indices: [] };
                        }
                        acc[product.id].quantity += 1;
                        acc[product.id].indices.push(cart.indexOf(product)); // Store indices to remove
                        return acc;
                      }, {} as Record<string, { product: Product; quantity: number, indices: number[] }>)
                    ) as { product: Product; quantity: number, indices: number[] }[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-6 py-6 border-b border-brand-border last:border-0"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full sm:w-24 h-48 sm:h-32 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-brand-text text-lg">
                            {item.product.name}
                          </h4>
                          <p className="text-brand-muted text-sm mb-4">
                            {item.product.category}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleRemoveFromCart(cart.findIndex(p => p.id === item.product.id))}
                                className="px-3 py-1 bg-brand-bg hover:bg-brand-muted/10 text-brand-text transition-colors"
                              >
                                -
                              </button>
                              <span className="px-4 py-1 text-sm font-medium border-x border-brand-border">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleAddToCart(item.product, 1)}
                                className="px-3 py-1 bg-brand-bg hover:bg-brand-muted/10 text-brand-text transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                // Remove all instances of this product
                                const newCart = cart.filter(p => p.id !== item.product.id);
                                setCart(newCart);
                                syncToDatabase(wishlist, newCart);
                              }}
                              className="flex items-center text-sm text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                const newCart = cart.filter(p => p.id !== item.product.id);
                                setCart(newCart);
                                if (!wishlist.some(w => w.id === item.product.id)) {
                                  handleToggleWishlist(item.product);
                                }
                                syncToDatabase(wishlist, newCart);
                                showToast(`Moved ${item.product.name} to wishlist`, 'info');
                              }}
                              className="flex items-center text-sm text-brand-muted hover:text-brand-text transition-colors"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              Move to Wishlist
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between sm:block items-center mt-4 sm:mt-0 text-right">
                          <span className="sm:hidden text-brand-muted text-sm">
                            Price:
                          </span>
                          <div className="font-bold text-brand-text text-xl">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-brand-muted mt-1">
                              {formatPrice(item.product.price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-brand-border flex flex-col gap-2">
                    <div className="flex justify-between items-center text-brand-muted">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-brand-accent font-medium">
                        <span>Discount (Buy 5 Get 1 Free)</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                      <span className="text-lg font-semibold text-brand-text">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-brand-text">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        setLoginMessage("Please sign in to proceed to checkout.");
                        setPendingAction(() => () => setView("checkout"));
                        setShowLoginModal(true);
                      } else {
                        setView("checkout");
                      }
                    }}
                    className="w-full mt-8 px-8 py-4 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-hover transition-colors shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === "checkout" && (
            <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
              <Checkout
                cart={(Object.values(
                  cart.reduce((acc, product) => {
                    if (!acc[product.id]) {
                      acc[product.id] = { product, quantity: 0 };
                    }
                    acc[product.id].quantity += 1;
                    return acc;
                  }, {} as Record<string, { product: Product; quantity: number }>)
                ) as { product: Product; quantity: number }[])}
                discountAmount={discountAmount}
                onBack={() => setView("cart")}
                onComplete={(orderId) => {
                  setCart([]);
                  syncToDatabase(wishlist, []);
                  setLastOrderId(orderId);
                  setView("order-confirmation");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </Suspense>
          )}

          {view === "order-confirmation" && (
            <motion.div
              key="order-confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center min-h-[70vh] flex flex-col justify-center items-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-serif font-bold text-brand-text mb-4">
                Thank You for Your Order!
              </h2>
              <p className="text-lg text-brand-muted mb-8 max-w-lg mx-auto">
                Your order has been successfully placed. We've sent a
                confirmation email with your order details and tracking
                information.
              </p>
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-10 w-full max-w-md">
                <p className="text-sm text-brand-muted mb-2">Order Number</p>
                <p className="text-xl font-mono font-bold text-brand-text">
                  {lastOrderId ? `#${lastOrderId.slice(0, 8).toUpperCase()}` : `#FW-${Math.floor(100000 + Math.random() * 900000)}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setView("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-10 py-4 bg-brand-accent text-white rounded-full font-semibold hover:bg-brand-accent-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
              >
                Continue Shopping
              </button>
            </motion.div>
          )}

          {view === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <Profile user={user} onLogout={handleLogout} setView={setView} />
              </Suspense>
            </motion.div>
          )}

          {view === "track-order" && (
            <motion.div
              key="track-order"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <TrackOrder />
              </Suspense>
            </motion.div>
          )}

          {view === "faqs" && (
            <motion.div
              key="faqs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <FAQs />
              </Suspense>
            </motion.div>
          )}

          {view === "size-guide" && (
            <motion.div
              key="size-guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <SizeGuide />
              </Suspense>
            </motion.div>
          )}

          {view === "returns" && (
            <motion.div
              key="returns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <Returns />
              </Suspense>
            </motion.div>
          )}

          {view === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <About />
              </Suspense>
            </motion.div>
          )}

          {view === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>}>
                <Contact />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer setView={setView} />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingAction(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        message={loginMessage}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-brand-card border-brand-border text-brand-text'
              }`}>
              {toast.type === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-brand-text" />
                </div>
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookieConsent />
    </div>
  );
}
