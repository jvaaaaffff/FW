import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Users, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl font-serif font-bold text-brand-text mb-6">Our Story</h1>
        <p className="text-xl text-brand-muted max-w-2xl mx-auto">
          We believe fashion should be accessible, sustainable, and empowering. We're on a mission to redefine how you shop for clothes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src="https://images.cbazaar.com/images/green-faux-georgette-embroidered-and-sequins-saree-sastc140gr-u.jpg"
            alt="Our studio"
            className="rounded-2xl shadow-lg object-cover w-full h-[500px]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-serif font-bold text-brand-text">Founded on Passion</h2>
          <p className="text-brand-muted text-lg leading-relaxed">
            FashionWeb started in 2020 with a simple idea: create high-quality, timeless pieces that don't cost the earth. We were frustrated by the fast fashion industry's impact on the environment and the lack of transparency in supply chains.
          </p>
          <p className="text-brand-muted text-lg leading-relaxed">
            We set out to build a brand that prioritizes ethical manufacturing, sustainable materials, and inclusive sizing. Every piece in our collection is thoughtfully designed to be a staple in your wardrobe for years to come.
          </p>
        </motion.div>
      </div>

      <div className="bg-brand-card rounded-3xl p-12 mb-24 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-text mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-brand-text">Sustainability First</h3>
            <p className="text-brand-muted">We use eco-friendly materials and partner with factories that prioritize reducing their carbon footprint.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-brand-text">Ethical Production</h3>
            <p className="text-brand-muted">We ensure fair wages, safe working conditions, and transparent supply chains for all our workers.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-brand-text">Timeless Design</h3>
            <p className="text-brand-muted">We create versatile, high-quality pieces designed to outlast trends and become wardrobe staples.</p>
          </div>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-brand-text mb-6">Join Our Journey</h2>
        <p className="text-brand-muted text-lg mb-8">
          We're constantly evolving and looking for ways to improve. Join our community and be part of the change towards a more sustainable fashion future.
        </p>
        <button className="px-8 py-4 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-muted transition-colors text-lg">
          Shop the Collection
        </button>
      </div>
    </div>
  );
};
