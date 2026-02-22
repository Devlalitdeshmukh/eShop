import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

type Season = 'All' | 'Summer' | 'Winter' | 'Festival';

interface SeasonalPopularProductsProps {
  title?: string;
}

const seasonalTabs: { label: string; value: Season }[] = [
  { label: "All", value: "All" },
  { label: "Summer", value: "Summer" },
  { label: "Winter", value: "Winter" },
  { label: "Festival", value: "Festival" },
];

const SeasonalPopularProducts = ({ title = "Most Popular This Season" }: SeasonalPopularProductsProps) => {
  const [season, setSeason] = useState<Season>('All');
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/products/season/${season}`);
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load seasonal products.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeason();
  }, [season]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {seasonalTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSeason(tab.value)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  season === tab.value
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-gray-500">Loading seasonal products...</div>
        )}
        {!loading && error && (
          <div className="py-10 text-center text-red-500">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} showDescription />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SeasonalPopularProducts;
