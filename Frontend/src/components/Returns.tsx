import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, ShieldCheck, Clock } from 'lucide-react';
import { formatPrice } from '../utils/format';

export const Returns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-serif font-bold text-brand-text mb-4">Returns & Exchanges</h1>
        <p className="text-brand-muted">We want you to love your purchase. If you don't, we make it easy to return or exchange.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-brand-card rounded-2xl p-8 border border-brand-border text-center">
          <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-brand-text" />
          </div>
          <h3 className="text-xl font-medium text-brand-text mb-2">30-Day Window</h3>
          <p className="text-brand-muted text-sm">You have 30 days from the date of delivery to return or exchange your items.</p>
        </div>
        <div className="bg-brand-card rounded-2xl p-8 border border-brand-border text-center">
          <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-6 h-6 text-brand-text" />
          </div>
          <h3 className="text-xl font-medium text-brand-text mb-2">Easy Process</h3>
          <p className="text-brand-muted text-sm">Initiate your return online, print the label, and drop it off at any carrier location.</p>
        </div>
        <div className="bg-brand-card rounded-2xl p-8 border border-brand-border text-center">
          <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-brand-text" />
          </div>
          <h3 className="text-xl font-medium text-brand-text mb-2">Quality Guarantee</h3>
          <p className="text-brand-muted text-sm">If your item arrives damaged or defective, we'll replace it at no extra cost.</p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-serif font-bold text-brand-text mb-4">Return Policy</h2>
          <div className="prose prose-brand text-brand-muted">
            <p className="mb-4">
              We gladly accept returns of unworn, unwashed, undamaged, or defective merchandise purchased online for a full refund or exchange within 30 days of original purchase.
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Items must be returned in their original condition with all tags attached.</li>
              <li>Final sale items cannot be returned or exchanged.</li>
              <li>Original shipping charges are non-refundable.</li>
              <li>A {formatPrice(5.95)} return shipping fee will be deducted from your refund if you use our prepaid label. Returns for store credit are always free.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-brand-text mb-4">How to Return or Exchange</h2>
          <div className="prose prose-brand text-brand-muted">
            <ol className="list-decimal pl-5 space-y-4">
              <li><strong>Start Your Return:</strong> Log into your account, go to Order History, and select the order you wish to return. Click "Start Return" and follow the prompts.</li>
              <li><strong>Print Label:</strong> Once approved, you will receive a prepaid shipping label via email. Print this label.</li>
              <li><strong>Pack Items:</strong> Securely pack the items in their original packaging (or a sturdy box). Include the packing slip.</li>
              <li><strong>Ship:</strong> Attach the label to the outside of the box and drop it off at the designated carrier location.</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-brand-text mb-4">Refund Processing</h2>
          <div className="prose prose-brand text-brand-muted">
            <p>
              Please allow 5-7 business days for your return to be processed once it reaches our warehouse. We will send you a confirmation email once your refund has been issued. Depending on your bank or credit card company, it may take an additional 3-5 business days for the funds to post to your account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
