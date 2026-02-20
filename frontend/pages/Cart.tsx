import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useStore } from '../store';

const Cart = () => {
  const { cart, removeFromCart, addToCart, cartTotal } = useStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any delicious treats yet.</p>
        <Link to="/shop" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={`${item.id}-${item.selectedVariantId || 'base'}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.category}</span>
                    {item.selectedVariantName && (
                      <span className="text-xs bg-brand-50 px-2 py-0.5 rounded text-brand-700 font-bold border border-brand-100">
                        {item.selectedVariantName}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-brand-600 mt-2">₹{item.discountPrice || item.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => addToCart(item, -1, item.selectedVariantId ? { id: item.selectedVariantId, name: item.selectedVariantName!, stock: 0 } : undefined)}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item, 1, item.selectedVariantId ? { id: item.selectedVariantId, name: item.selectedVariantName!, stock: 0 } : undefined)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedVariantId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5% GST)</span>
                  <span>₹{Math.round(cartTotal * 0.05)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{cartTotal + Math.round(cartTotal * 0.05)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;