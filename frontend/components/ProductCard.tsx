import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Flame } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useStore();

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.discountPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Save ₹{product.price - product.discountPrice}
          </span>
        )}
        {product.isSpicy && (
          <span className="absolute top-3 right-3 bg-brand-500 text-white p-1.5 rounded-full" title="Spicy">
            <Flame className="w-4 h-4" />
          </span>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-brand-600 font-semibold tracking-wide uppercase mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-serif font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-700">{product.rating}</span>
          <span className="text-sm text-gray-400">({product.reviews})</span>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                <span className="text-xl font-bold text-gray-900">₹{product.discountPrice}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            )}
          </div>
          
          <button 
            onClick={() => addToCart(product, 1)}
            className="p-3 bg-gray-900 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-gray-200"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;