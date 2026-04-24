import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  autoApply?: boolean;
}

interface OfferCarouselProps {
  promotions: Promotion[];
  onAction?: () => void;
}

export const OfferCarousel: React.FC<OfferCarouselProps> = ({ promotions, onAction }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activePromotions = promotions.filter((p) => p.active);

  useEffect(() => {
    if (activePromotions.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === activePromotions.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [activePromotions.length]);

  if (activePromotions.length === 0) {
    return (
      <div className="bg-brand-text text-brand-bg py-4 px-4 text-center text-sm sm:text-base font-medium tracking-widest uppercase items-center">
        Free Global Shipping on Orders Over $200.00 | Shop the New Collection
      </div>
    );
  }

  const currentPromotion = activePromotions[currentIndex];

  return (
    <div className="bg-brand-text text-brand-bg py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="min-w-0 w-full max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-brand-text font-medium text-sm sm:text-base leading-tight whitespace-normal">
                  {currentPromotion.title}
                </div>
                {currentPromotion.description && (
                  <div className="text-brand-muted text-xs sm:text-sm mt-1 leading-relaxed whitespace-normal">
                    {currentPromotion.description}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};
