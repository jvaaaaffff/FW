export interface LandingPromotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  autoApply?: boolean;
  linkText?: string;
  linkUrl?: string;
}

export interface DiscountCode {
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'shipping';
  percentage?: number;
  amount?: number;
  minSpend?: number;
  buyCount?: number;
  getFreeCount?: number;
  shippingDiscount?: boolean;
  autoApply?: boolean;
  active: boolean;
}

export const landingPromotions: LandingPromotion[] = [
  {
    id: 'global-shipping',
    title: 'Free Global Shipping',
    description: 'Free Global Shipping on orders over ₹200.00 | Shop the New Collection',
    active: true,
    linkText: 'Shop Now',
    linkUrl: '/category',
  },
  {
    id: 'buy1-get1',
    title: 'Buy 1 Get 1 Free',
    description: 'Buy one saree and get the lowest priced item free on select orders.',
    active: true,
  },
  {
    id: 'auto-save-10',
    title: 'Auto Save 10%',
    description: 'Spend over ₹5000 and receive an automatic 10% cart discount.',
    active: true,
    autoApply: true,
  },
  {
    id: 'new-collection',
    title: 'Shop the New Collection',
    description: 'Fresh designs added weekly — discover trending sarees now.',
    active: true,
  },
];

export const discountCodes: DiscountCode[] = [
  {
    code: 'SAVE10',
    title: '10% Off Over ₹5000',
    description: 'Get 10% off when your order is above ₹5000.',
    type: 'percentage',
    percentage: 10,
    minSpend: 5000,
    active: true,
  },
  {
    code: 'BUY1GET1',
    title: 'Buy 1 Get 1 Free',
    description: 'Buy one item and get one item of equal or lesser value free.',
    type: 'bogo',
    buyCount: 1,
    getFreeCount: 1,
    active: true,
  },
  {
    code: 'GLOBALSHIP',
    title: 'Free Global Shipping',
    description: 'Free shipping applied automatically on orders over ₹200.',
    type: 'shipping',
    minSpend: 200,
    shippingDiscount: true,
    active: true,
  },
  {
    code: 'AUTO10',
    title: 'Automatic 10% Discount',
    description: 'Automatically applies 10% off when your order reaches ₹5000.',
    type: 'percentage',
    percentage: 10,
    minSpend: 5000,
    autoApply: true,
    active: true,
  },
];
