import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

interface BestSellingProductsProps {
  title?: string;
}

const BestSellingProducts = ({ title = "Most & Best Selling Products" }: BestSellingProductsProps) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products/best-selling');
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load best selling products.');
      } finally {
        setLoading(false);
      }
    };
    fetchBestSelling();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          <Link to="/shop" className="hidden md:block text-brand-600 font-semibold hover:text-brand-700">
            View all
          </Link>
        </div>

        {loading && (
          <div className="py-16 text-center text-gray-500">Loading best selling products...</div>
        )}
        {!loading && error && (
          <div className="py-10 text-center text-red-500">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellingProducts;
