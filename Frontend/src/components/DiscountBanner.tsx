import React from 'react';
import { activeDiscounts } from '../config/discounts';
import { Tag } from 'lucide-react';

export const DiscountBanner: React.FC = () => {
  const active = activeDiscounts.filter(d => d.active);
  if (active.length === 0) return null;

  return (
    <div className="bg-brand-accent/10 border-b border-brand-accent/20 py-2 overflow-hidden w-full">
      <div className="flex justify-center w-full px-4">
        {active.map(discount => (
          <div key={discount.id} className="flex items-center text-brand-accent text-sm font-medium text-center">
            <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
            <span><span className="font-bold mr-1">{discount.title}:</span> {discount.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
