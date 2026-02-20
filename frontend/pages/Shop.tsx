import React, { useState } from 'react';
import { useStore } from '../store';
import ProductCard from '../components/ProductCard';
import { Search, X } from 'lucide-react';

const Shop = () => {
  const { products } = useStore();
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Achar', 'Papad', 'Namkeen', 'Snacks'];

  const filteredProducts = products.filter(product => {
    // Case-insensitive real-time filtering
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Shop Our Collection</h1>
            <p className="text-gray-500 text-sm mt-1">Found {filteredProducts.length} authentic products</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products by name..."
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none w-full bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                category === cat 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => { setCategory('All'); setSearchTerm(''); }}
              className="mt-6 bg-brand-50 text-brand-600 px-6 py-2 rounded-lg font-bold hover:bg-brand-100 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;