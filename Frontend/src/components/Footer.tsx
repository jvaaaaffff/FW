import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setView: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-brand-card border-t border-brand-border text-brand-text py-10 sm:py-12 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-8">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tighter cursor-pointer" onClick={() => setView('home')}>
              FASHION<span className="font-sans font-light text-brand-muted text-lg">WEB</span>
            </h2>
            <p className="text-brand-muted leading-7 max-w-xl">
              Exquisite hand-worked sarees crafted with precision and traditional elegance. Our mission is to bring the finest ethnic wear to your doorstep.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-brand-bg rounded-full hover:bg-brand-border transition-colors">
                <Facebook className="w-5 h-5 text-brand-text" />
              </a>
              <a href="#" className="p-2 bg-brand-bg rounded-full hover:bg-brand-border transition-colors">
                <Twitter className="w-5 h-5 text-brand-text" />
              </a>
              <a href="#" className="p-2 bg-brand-bg rounded-full hover:bg-brand-border transition-colors">
                <Instagram className="w-5 h-5 text-brand-text" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-4 text-brand-muted">
              <li><button onClick={() => setView('about')} className="text-left hover:text-brand-text transition-colors">About Us</button></li>
              <li><button onClick={() => setView('category')} className="text-left hover:text-brand-text transition-colors">Our Collections</button></li>
              <li><button onClick={() => setView('contact')} className="text-left hover:text-brand-text transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Customer Care</h3>
            <ul className="space-y-4 text-brand-muted">
              <li><button onClick={() => setView('returns')} className="text-left hover:text-brand-text transition-colors">Returns & Exchanges</button></li>
              <li><button onClick={() => setView('size-guide')} className="text-left hover:text-brand-text transition-colors">Size Guide</button></li>
              <li><button onClick={() => setView('faqs')} className="text-left hover:text-brand-text transition-colors">FAQs</button></li>
              <li><button onClick={() => setView('track-order')} className="text-left hover:text-brand-text transition-colors">Track Order</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Contact Info</h3>
            <ul className="space-y-4 text-brand-muted">
              <li className="flex items-start gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-brand-accent shrink-0" />
                <span className="block wrap-break-word leading-7">
                  Plot No. 1-2, Shiva Industrial Park, Opp. L.P. Savani School, Daya Park Road, Opp. Varsha Society-2, Near Torrent Power, Varachha, Surat, Gujarat – 395006
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-accent shrink-0" />
                <span>+91 98750 27782</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-accent shrink-0" />
                <span>support@fashionweb.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-border text-sm text-brand-muted text-center">
          <p>© 2026 fashionweb. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};