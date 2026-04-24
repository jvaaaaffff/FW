import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unworn, unwashed items with tags attached. Returns are free for store credit, or a small fee applies for refunds to the original payment method."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days within the contiguous US. Expedited shipping options (2-day and overnight) are available at checkout."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and times vary by destination and will be calculated at checkout."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with a tracking link. You can also track your order by logging into your account or visiting our Track Order page."
  },
  {
    question: "Are your sizes true to fit?",
    answer: "Our clothing generally runs true to size. However, fit can vary by style. We recommend checking our detailed Size Guide and reading customer reviews for specific items."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay."
  }
];

export const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-serif font-bold text-brand-text mb-4">Frequently Asked Questions</h1>
        <p className="text-brand-muted">Find answers to common questions about our products, shipping, and returns.</p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-brand-card rounded-2xl border border-brand-border overflow-hidden"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-lg font-medium text-brand-text">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-brand-muted shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-5 h-5 text-brand-muted shrink-0 ml-4" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-5 text-brand-muted">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
