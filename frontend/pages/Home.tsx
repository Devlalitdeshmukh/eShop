import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { useStore } from '../store';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:w-1/2">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Taste the Love of <span className="text-brand-600">Homemade</span> Tradition
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Authentic Achars, Crispy Papads, and Spicy Namkeens made from generations-old recipes. No preservatives, just pure nostalgia.
            </p>
            <div className="flex gap-4">
              <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 md:text-lg shadow-lg hover:shadow-xl transition-all">
                Shop Now
              </Link>
              <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 md:text-lg">
                View Bestsellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">100% Natural</h3>
              <p className="text-gray-500">No artificial preservatives or colors. Just like Mom makes it.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Hygienically Packed</h3>
              <p className="text-gray-500">Vacuum sealed jars ensuring freshness and safety delivered to you.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
              <p className="text-gray-500">Shipping across India. Get your cravings fixed in 2-3 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Customer Favorites</span>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">Trending Delights</h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-brand-600 font-semibold hover:text-brand-700">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-700">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;