import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  onShopNow: () => void;
  onBridalCollection: () => void;
}

const slides = [
  {
    id: 1,
    image: "https://images.cbazaar.com/images/rani-pink-rangoli-silk-embroidered-sequins-zari-saree-sassd08008-u.jpg",
    topText: "The Wedding Edit '26",
    title: "Timeless Grace",
    description: "Discover our exclusive collection of handcrafted sarees, where traditional artistry meets contemporary grace."
  },
  {
    id: 2,
    image: "https://images.cbazaar.com/images/bottle-green-banarasi-silk-zari-woven-saree-saske6004-u.jpg",
    topText: "Festive Collection",
    title: "Modern Heritage",
    description: "Embrace the season with vibrant colors and intricate embellishments designed for celebration."
  },
  {
    id: 3,
    image: "https://images.cbazaar.com/images/red-georgette-embroidered-saree-sasaca5962-u.jpg",
    topText: "Designer Exclusives",
    title: "Artisanal Craft",
    description: "Experience the luxury of bespoke fashion, tailored to perfection for your most memorable moments."
  },
  {
    id: 4,
    image: "https://images.cbazaar.com/images/peach-net-sequins-embroidered-saree-sashe352-u.jpg",
    topText: "Classic Handwork",
    title: "Woven Dreams",
    description: "Step into elegance with our signature hand-woven textiles and breathtaking silhouettes."
  },
  {
    id: 5,
    image: "https://images.cbazaar.com/images/yellow-faux-georgette-embroidered-saree-sasprt16954-u.jpg",
    topText: "Premium Beads",
    title: "Luminous Details",
    description: "Shine in every light with our meticulously hand-beaded masterpieces."
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onShopNow, onBridalCollection }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [current]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative bg-brand-bg overflow-hidden min-h-[calc(100vh-80px)] flex items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Blurred background image to fill empty space */}
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl"
            src={slides[current].image}
            alt={slides[current].title}
            referrerPolicy="no-referrer"
          />
          {/* Main image that fits perfectly */}
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="relative w-full h-full object-contain"
            src={slides[current].image}
            alt={slides[current].title}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-brand-bg via-brand-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all cursor-pointer hover:scale-110 transform"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all cursor-pointer hover:scale-110 transform"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center h-full z-10 w-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center pointer-events-auto"
          >
            <p className="text-xs sm:text-sm font-bold tracking-[0.3em] text-white uppercase mb-4">
              {slides[current].topText}
            </p>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold tracking-tighter text-white mb-6 leading-none drop-shadow-lg">
              {slides[current].title}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-white/90 mb-10 leading-relaxed font-light drop-shadow-md">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mt-4 pointer-events-auto"
        >
          <button
            onClick={onShopNow}
            className="w-full sm:w-auto px-12 py-4 bg-white text-brand-text rounded-sm font-bold uppercase tracking-widest hover:bg-brand-bg transition-all duration-300 text-xs"
          >
            Shop Now
          </button>
          <button
            onClick={onBridalCollection}
            className="w-full sm:w-auto px-12 py-4 bg-transparent text-white border border-white rounded-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all duration-300 text-xs"
          >
            Bridal Collection
          </button>
        </motion.div>
      </div>
    </div>
  );
};
