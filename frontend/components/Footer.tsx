import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const { contactus } = useStore();
  const contactInfo = contactus[0];

  return (
    <footer className="bg-gray-900 text-white py-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-4">Desi Delights</h3>
          <p className="text-gray-400">Bringing the authentic taste of Indian home kitchens directly to your doorstep. Handmade with love.</p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
            <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Our Products</Link></li>
            <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4">Contact</h4>
          <p className="text-gray-400">{contactInfo?.email || 'support@desidelights.com'}</p>
          <p className="text-gray-400">{contactInfo?.phone || '+91 98765 43210'}</p>
          {contactInfo?.address && <p className="text-gray-400 mt-2">{contactInfo.address}</p>}
          <div className="mt-4 flex space-x-3">
             {/* Social Media Icons */}
             {contactInfo?.instagram && (
               <a 
                 href={contactInfo.instagram} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 hover:bg-brand-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                 aria-label="Instagram"
               >
                 <Instagram className="w-5 h-5" />
               </a>
             )}
             {contactInfo?.facebook && (
               <a 
                 href={contactInfo.facebook} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 hover:bg-brand-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                 aria-label="Facebook"
               >
                 <Facebook className="w-5 h-5" />
               </a>
             )}
             {contactInfo?.linkedin && (
               <a 
                 href={contactInfo.linkedin} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 hover:bg-brand-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                 aria-label="LinkedIn"
               >
                 <Linkedin className="w-5 h-5" />
               </a>
             )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        © 2023 Desi Delights. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;