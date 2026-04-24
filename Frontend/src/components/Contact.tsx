import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-serif font-bold text-brand-text mb-4">Contact Us</h1>
        <p className="text-brand-muted max-w-2xl mx-auto">
          We're here to help! Whether you have a question about an order, need styling advice, or just want to say hello, we'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-text mb-8">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-brand-card rounded-full flex items-center justify-center shrink-0 border border-brand-border">
                  <Mail className="w-5 h-5 text-brand-text" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-brand-text">Email</h3>
                  <p className="text-brand-muted mb-1">Our team typically responds within 24 hours.</p>
                  <a href="mailto:support@fashionweb.com" className="text-brand-accent hover:underline font-medium">support@fashionweb.com</a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-brand-card rounded-full flex items-center justify-center shrink-0 border border-brand-border">
                  <Phone className="w-5 h-5 text-brand-text" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-brand-text">Phone</h3>
                  <p className="text-brand-muted mb-1">Mon-Fri from 9am to 6pm EST.</p>
                  <a href="tel:+18005550199" className="text-brand-accent hover:underline font-medium">+1 (800) 555-0199</a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-brand-card rounded-full flex items-center justify-center shrink-0 border border-brand-border">
                  <MapPin className="w-5 h-5 text-brand-text" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-brand-text">Office</h3>
                  <p className="text-brand-muted">Come visit our flagship store.</p>
                  <address className="not-italic text-brand-text mt-1">
                    123 Fashion Avenue<br />
                    New York, NY 10001<br />
                    United States
                  </address>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-card rounded-3xl p-8 md:p-10 shadow-sm border border-brand-border"
        >
          <h2 className="text-2xl font-serif font-bold text-brand-text mb-6">Send a Message</h2>
          
          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-muted mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-brand-muted mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-muted mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-muted transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
