import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Star,
  Truck,
  ShieldCheck,
  Facebook,
  Twitter,
  Share2,
  Minus,
  Plus,
  MapPin,
  Check,
  AlertTriangle
} from "lucide-react";
import { Product } from "../types";
import { ProductCard } from "./ProductCard";
import { ProductReviews } from "./ProductReviews";
import { formatPrice } from "../utils/format";
import { FREE_SHIPPING_THRESHOLD } from "../config/discounts";

interface ProductDetailProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  allProducts: Product[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBack,
  onProductClick,
  allProducts,
}) => {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const inlineButtonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (inlineButtonsRef.current) {
      observer.observe(inlineButtonsRef.current);
    }

    return () => {
      if (inlineButtonsRef.current) {
        observer.unobserve(inlineButtonsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedImage(product.image);
    setQuantity(1);
    setSelectedColor('black');
    setSelectedSize('Free Size');
    setPincode('');
    setPincodeStatus('idle');
    window.scrollTo(0, 0);
  }, [product]);

  const handleCheckPincode = () => {
    if (!pincode || pincode.length < 5) return;
    setPincodeStatus('checking');
    setTimeout(() => {
      // Mock validation
      if (pincode.startsWith('0')) {
        setPincodeStatus('error');
      } else {
        setPincodeStatus('success');
      }
    }, 1000);
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Mock additional images for the gallery
  const galleryImages = [
    product.image,
    `https://picsum.photos/seed/${product.id}-1/800/1000`,
    `https://picsum.photos/seed/${product.id}-2/800/1000`,
    `https://picsum.photos/seed/${product.id}-3/800/1000`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-32 sm:pb-16"
    >
      <button
        onClick={onBack}
        className="flex items-center text-brand-muted hover:text-brand-text transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="aspect-[4/5] bg-brand-bg rounded-2xl overflow-hidden group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? "border-brand-text" : "border-transparent hover:border-brand-border"}`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col lg:sticky lg:top-24 lg:h-fit"
        >
          <div className="mb-6">
            <div className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-2">
              {product.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-text mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold text-brand-text">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="text-brand-muted text-sm ml-2">
                  (128 reviews)
                </span>
              </div>
            </div>
            <div className="text-brand-muted leading-relaxed">
              <p className={isDescriptionExpanded ? "" : "line-clamp-3"}>
                {product.description}
              </p>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-brand-text font-medium mt-2 hover:underline"
              >
                {isDescriptionExpanded ? "Read less" : "Read more"}
              </button>
            </div>
          </div>

          <div className="space-y-8 mb-8">
            {/* Color Options */}
            <div>
              <h3 className="text-sm font-medium text-brand-text uppercase tracking-wider mb-3">Color: <span className="text-brand-muted capitalize">{selectedColor}</span></h3>
              <div className="flex items-center gap-3">
                {['black', 'white', 'gray', 'navy'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-brand-text scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`}
                    style={{ backgroundColor: color === 'white' ? '#f8f9fa' : color === 'navy' ? '#1a2942' : color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>

            {/* Size Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-brand-text uppercase tracking-wider">Size</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedSize('Free Size')}
                  className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all border-brand-text bg-brand-text text-brand-bg`}
                >
                  Free Size
                </button>
              </div>
              <p className="text-xs text-brand-muted mt-2">Sarees come in a standard free size (approx. 5.5 meters) with an unstitched blouse piece.</p>
            </div>

            {/* Delivery Pincode */}
            <div className="bg-brand-bg p-5 rounded-2xl border border-brand-border">
              <h3 className="text-sm font-medium text-brand-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Options
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-4 py-2.5 bg-brand-card border border-brand-border rounded-xl focus:outline-none focus:border-brand-text text-brand-text"
                />
                <button
                  onClick={handleCheckPincode}
                  disabled={pincodeStatus === 'checking' || pincode.length < 5}
                  className="px-6 py-2.5 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-muted transition-colors disabled:opacity-50"
                >
                  {pincodeStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              </div>
              {pincodeStatus === 'success' && (
                <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Delivery available to {pincode}. Usually ships in 2-3 days.
                </p>
              )}
              {pincodeStatus === 'error' && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Delivery not available for this pincode.
                </p>
              )}
            </div>

            {/* Product Details Section */}
            <div className="border-t border-brand-border pt-6">
              <h3 className="text-sm font-medium text-brand-text uppercase tracking-wider mb-4">Product Details & Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-brand-muted">
                <div>
                  <span className="font-medium text-brand-text">Fabric:</span> Premium Silk Blend
                </div>
                <div>
                  <span className="font-medium text-brand-text">Pattern:</span> Intricate Zari Woven Work
                </div>
                <div>
                  <span className="font-medium text-brand-text">Length:</span> 5.5 Meters (Saree) + 0.8 Meters (Blouse)
                </div>
                <div>
                  <span className="font-medium text-brand-text">Blouse Piece:</span> Unstitched, included
                </div>
                <div>
                  <span className="font-medium text-brand-text">Occasion:</span> Festive, Wedding, Party Wear
                </div>
                <div>
                  <span className="font-medium text-brand-text">Care Instructions:</span> Dry clean only
                </div>
                <div className="sm:col-span-2 mt-2">
                  <span className="font-medium text-brand-text block mb-1">Description:</span> 
                  Experience the elegance of traditional craftsmanship with this beautifully woven saree. The rich texture and intricate borders make it a perfect choice for your special occasions. Drape it with traditional jewelry to complete the ethnic look.
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-border">
              <div className="flex items-center gap-3 text-sm text-brand-muted">
                <Truck className="w-5 h-5 text-brand-muted/70" />
                Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </div>
              <div className="flex items-center gap-3 text-sm text-brand-muted">
                <ShieldCheck className="w-5 h-5 text-brand-muted/70" />
                Authentic hand-worked craftsmanship
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-auto pt-8 border-t border-brand-border">
            {/* Inline Buttons */}
            <div ref={inlineButtonsRef} className="flex items-center gap-4">
              <div className="flex items-center border-2 border-brand-border rounded-xl overflow-hidden h-14">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full flex items-center justify-center hover:bg-brand-bg text-brand-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 text-center font-medium text-brand-text">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 h-full flex items-center justify-center hover:bg-brand-bg text-brand-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 h-14 bg-brand-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-accent-hover transition-colors shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className={`h-14 w-14 rounded-xl border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-50 text-rose-500"
                    : "border-brand-border bg-brand-card text-brand-muted hover:border-brand-text"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4 pt-4 border-t border-brand-border">
              <span className="text-sm font-medium text-brand-muted uppercase tracking-wider">
                Share:
              </span>
              <button className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-muted hover:bg-brand-border hover:text-brand-text transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-muted hover:bg-brand-border hover:text-brand-text transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-muted hover:bg-brand-border hover:text-brand-text transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-brand-border pt-16"
        >
          <h2 className="text-2xl font-serif font-bold text-brand-text mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={false}
                onToggleWishlist={() => {}}
                onAddToCart={() => {}}
                onClick={onProductClick || (() => {})}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <AnimatePresence>
        {isStickyVisible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-brand-bg border-t border-brand-border p-3 flex sm:hidden items-center gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
          >
            <button
              onClick={() => onToggleWishlist(product)}
              className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                isWishlisted
                  ? "border-rose-500 bg-rose-50 text-rose-500"
                  : "border-brand-border bg-brand-card text-brand-text hover:border-brand-text"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
              />
              <span className="uppercase tracking-wider text-xs">Wishlist</span>
            </button>

            <button
              onClick={() => onAddToCart(product, quantity)}
              className="flex-1 h-12 bg-brand-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-accent-hover transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="uppercase tracking-wider text-xs">Add to Bag</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
