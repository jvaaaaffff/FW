import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Search, MapPin, CheckCircle2, Clock, Truck } from 'lucide-react';
import { generateTrackingInfo, TrackingInfo } from '../services/trackingService';

export const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsTracking(false);

    try {
      const data = await generateTrackingInfo(orderId, email);
      setTrackingData(data);
      setIsTracking(true);
    } catch {
      // Silent tracking failure.
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'processing': return 25;
      case 'shipped': return 50;
      case 'in_transit': return 75;
      case 'out_for_delivery': return 90;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-serif font-bold text-brand-text mb-4">Track Your Order</h1>
        <p className="text-brand-muted">Enter your order details below to see the current status of your shipment.</p>
      </motion.div>

      <div className="bg-brand-card rounded-2xl p-8 shadow-sm border border-brand-border mb-12">
        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. FW-123456"
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-muted transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              <span>{isLoading ? 'Tracking...' : 'Track Order'}</span>
            </button>
          </div>
        </form>
      </div>

      {isTracking && trackingData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-brand-card rounded-2xl p-8 shadow-sm border border-brand-border"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-brand-border gap-4">
            <div>
              <h3 className="text-lg font-medium text-brand-text">Order #{orderId || 'FW-123456'}</h3>
              <p className="text-sm text-brand-muted mt-1">
                Via {trackingData.carrier} • Estimated Delivery: <span className="font-medium text-brand-text">{trackingData.estimatedDelivery}</span>
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {getStatusText(trackingData.status)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="h-2 w-full bg-brand-bg rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getStatusProgress(trackingData.status)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-brand-muted">
              <span>Processed</span>
              <span>Shipped</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-brand-border"></div>

            <div className="space-y-8 relative">
              {trackingData.updates.map((update, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 ${index === 0
                      ? 'bg-brand-text text-brand-bg'
                      : 'bg-brand-card border-2 border-brand-text text-brand-text'
                    }`}>
                    {index === 0 ? <Truck className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-medium text-brand-text">{update.status}</h4>
                    <p className="text-brand-muted">{update.location}</p>
                    <p className="text-sm text-brand-muted mt-1">{update.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
