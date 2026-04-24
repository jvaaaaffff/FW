export interface DiscountRule {
  id: string;
  title: string;
  description: string;
  type: 'bogo' | 'percentage' | 'fixed';
  buyCount?: number;
  getFreeCount?: number;
  percentage?: number;
  minSpend?: number;
  active: boolean;
}

export const FREE_SHIPPING_THRESHOLD = 200;

export const activeDiscounts: DiscountRule[] = [
  {
    id: 'BUY5GET1',
    title: 'BUY 5 GET 1 FREE',
    description: 'Add 6 items to your cart and the lowest priced item is on us!',
    type: 'bogo',
    buyCount: 5,
    getFreeCount: 1,
    active: true,
  },
];
