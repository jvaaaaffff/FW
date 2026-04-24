import React from 'react';
import { motion } from 'motion/react';

export const SizeGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-serif font-bold text-brand-text mb-4">Size Guide</h1>
        <p className="text-brand-muted">Find your perfect fit with our comprehensive sizing charts.</p>
      </motion.div>

      <div className="bg-brand-card rounded-2xl p-8 shadow-sm border border-brand-border mb-12">
        <h2 className="text-2xl font-serif font-bold text-brand-text mb-6">Women's Clothing</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="py-4 px-6 font-medium text-brand-muted">Size</th>
                <th className="py-4 px-6 font-medium text-brand-muted">US</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Bust (in)</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Waist (in)</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Hips (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">XS</td>
                <td className="py-4 px-6 text-brand-muted">0-2</td>
                <td className="py-4 px-6 text-brand-muted">31.5-32.5</td>
                <td className="py-4 px-6 text-brand-muted">23.5-24.5</td>
                <td className="py-4 px-6 text-brand-muted">34-35</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">S</td>
                <td className="py-4 px-6 text-brand-muted">4-6</td>
                <td className="py-4 px-6 text-brand-muted">33.5-34.5</td>
                <td className="py-4 px-6 text-brand-muted">25.5-26.5</td>
                <td className="py-4 px-6 text-brand-muted">36-37</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">M</td>
                <td className="py-4 px-6 text-brand-muted">8-10</td>
                <td className="py-4 px-6 text-brand-muted">35.5-36.5</td>
                <td className="py-4 px-6 text-brand-muted">27.5-28.5</td>
                <td className="py-4 px-6 text-brand-muted">38-39</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">L</td>
                <td className="py-4 px-6 text-brand-muted">12-14</td>
                <td className="py-4 px-6 text-brand-muted">38-39.5</td>
                <td className="py-4 px-6 text-brand-muted">30-31.5</td>
                <td className="py-4 px-6 text-brand-muted">40.5-42</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-brand-text font-medium">XL</td>
                <td className="py-4 px-6 text-brand-muted">16-18</td>
                <td className="py-4 px-6 text-brand-muted">41-43</td>
                <td className="py-4 px-6 text-brand-muted">33-35</td>
                <td className="py-4 px-6 text-brand-muted">43.5-45.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand-card rounded-2xl p-8 shadow-sm border border-brand-border mb-12">
        <h2 className="text-2xl font-serif font-bold text-brand-text mb-6">Men's Clothing</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="py-4 px-6 font-medium text-brand-muted">Size</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Chest (in)</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Waist (in)</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Neck (in)</th>
                <th className="py-4 px-6 font-medium text-brand-muted">Sleeve (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">S</td>
                <td className="py-4 px-6 text-brand-muted">35-37</td>
                <td className="py-4 px-6 text-brand-muted">29-31</td>
                <td className="py-4 px-6 text-brand-muted">14-14.5</td>
                <td className="py-4 px-6 text-brand-muted">32-33</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">M</td>
                <td className="py-4 px-6 text-brand-muted">38-40</td>
                <td className="py-4 px-6 text-brand-muted">32-34</td>
                <td className="py-4 px-6 text-brand-muted">15-15.5</td>
                <td className="py-4 px-6 text-brand-muted">33-34</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">L</td>
                <td className="py-4 px-6 text-brand-muted">41-43</td>
                <td className="py-4 px-6 text-brand-muted">35-37</td>
                <td className="py-4 px-6 text-brand-muted">16-16.5</td>
                <td className="py-4 px-6 text-brand-muted">34-35</td>
              </tr>
              <tr className="border-b border-brand-border/50">
                <td className="py-4 px-6 text-brand-text font-medium">XL</td>
                <td className="py-4 px-6 text-brand-muted">44-46</td>
                <td className="py-4 px-6 text-brand-muted">38-40</td>
                <td className="py-4 px-6 text-brand-muted">17-17.5</td>
                <td className="py-4 px-6 text-brand-muted">35-36</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-brand-text font-medium">XXL</td>
                <td className="py-4 px-6 text-brand-muted">47-49</td>
                <td className="py-4 px-6 text-brand-muted">41-43</td>
                <td className="py-4 px-6 text-brand-muted">18-18.5</td>
                <td className="py-4 px-6 text-brand-muted">36-36.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand-bg rounded-2xl p-8 border border-brand-border text-center">
        <h3 className="text-xl font-medium text-brand-text mb-2">How to Measure</h3>
        <p className="text-brand-muted mb-6">For the most accurate measurements, have someone else measure you while wearing light clothing.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div>
            <h4 className="font-medium text-brand-text mb-1">Bust/Chest</h4>
            <p className="text-sm text-brand-muted">Measure around the fullest part of your chest, keeping the tape level under your arms.</p>
          </div>
          <div>
            <h4 className="font-medium text-brand-text mb-1">Waist</h4>
            <p className="text-sm text-brand-muted">Measure around your natural waistline, keeping the tape comfortably loose.</p>
          </div>
          <div>
            <h4 className="font-medium text-brand-text mb-1">Hips</h4>
            <p className="text-sm text-brand-muted">Stand with your heels together and measure around the fullest part of your hips.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
