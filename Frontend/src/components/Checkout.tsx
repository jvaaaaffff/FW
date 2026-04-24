import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../config/discounts';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  discountAmount?: number;
  shippingDiscount?: boolean;
  appliedCoupon?: { code: string; title: string; description: string; amount: number; shippingDiscount?: boolean } | null;
  onBack: () => void;
  onComplete: (orderId: string) => void;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  couponMessage?: { type: 'success' | 'error' | 'info'; text: string } | null;
}

export const Checkout: React.FC<CheckoutProps> = ({
  cart,
  discountAmount = 0,
  shippingDiscount = false,
  appliedCoupon,
  onBack,
  onComplete,
  onApplyCoupon,
  onRemoveCoupon,
  couponMessage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = ((subtotal - discountAmount) > FREE_SHIPPING_THRESHOLD || shippingDiscount) ? 0 : 25;
  const total = subtotal - discountAmount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;

    setIsApplyingCoupon(true);
    try {
      await onApplyCoupon(couponCode.trim().toUpperCase());
    } catch {
      // Silent coupon apply error.
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon();
    }
    setCouponCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
      const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
      const address = (form.elements.namedItem('address') as HTMLInputElement).value;
      const city = (form.elements.namedItem('city') as HTMLInputElement).value;
      const postalCode = (form.elements.namedItem('postalCode') as HTMLInputElement).value;

      const orderData = {
        items: cart.map(item => ({ product: item.product, quantity: item.quantity })),
        total,
        shippingAddress: {
          firstName,
          lastName,
          address,
          city,
          country: 'US',
          postalCode,
        },
        appliedCoupon,
      };

      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok || !data.success || data.data?.paymentStatus === 'failed') {
        const serverMessage = data?.message || 'Failed to process order. Please try again.';
        throw new Error(serverMessage);
      }

      setIsProcessing(false);
      onComplete(data.data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <button
        onClick={onBack}
        className="flex items-center text-brand-muted hover:text-brand-text transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h1 className="text-3xl font-serif font-bold text-brand-text mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-muted mb-1">Email address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            {onApplyCoupon && (
              <section>
                <h2 className="text-xl font-semibold text-brand-text mb-4">Coupon Code</h2>
                {appliedCoupon ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.title}</p>
                        <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                        <p className="text-sm font-bold text-green-800">
                          -{formatPrice(appliedCoupon.amount)} {appliedCoupon.shippingDiscount ? '+ Free Shipping' : ''}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        type="button"
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all uppercase"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        className="px-6 py-3 bg-brand-accent text-white font-medium rounded-xl hover:bg-brand-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponMessage && (
                      <div className={`p-3 rounded-lg text-sm ${couponMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : couponMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                        {couponMessage.text}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-brand-muted mb-1">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-brand-muted mb-1">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-brand-muted mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-brand-muted mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-brand-muted mb-1">Postal code</label>
                  <input
                    type="text"
                    id="postalCode"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-brand-text mb-4">Payment Details</h2>
              <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-brand-muted" />
                  <span className="font-medium text-brand-text">Credit Card</span>
                </div>
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-brand-muted mb-1">Card number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    required
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-brand-muted mb-1">Expiry date</label>
                    <input
                      type="text"
                      id="expiry"
                      required
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-brand-muted mb-1">CVC</label>
                    <input
                      type="text"
                      id="cvc"
                      required
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-accent-hover transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Pay {formatPrice(total)}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-brand-bg rounded-3xl p-6 lg:p-8 border border-brand-border sticky top-24">
            <h2 className="text-xl font-serif font-bold text-brand-text mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-brand-card flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-brand-text line-clamp-2">{item.product.name}</h3>
                    <p className="text-sm text-brand-muted mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-brand-text mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-brand-border">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-accent font-medium">
                  <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-brand-text pt-3 border-t border-brand-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
