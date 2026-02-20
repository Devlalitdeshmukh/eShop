import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Edit, Calendar, Package, DollarSign, Tag, Flame, X, QrCode, Copy, Check } from 'lucide-react';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useStore();
  const { addToast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === id);
      if (found) setProduct(found);
    }
  }, [id, products]);

  if (!product) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );

  // Generate QR Code URL using a public API
  // We use HashRouter, so the URL structure includes /#/
  const productUrl = `${window.location.origin}/#/product/${product.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}&bgcolor=ffffff&color=000000&margin=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    addToast('Public link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/admin/products')} 
          className="flex items-center text-gray-500 hover:text-brand-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Products
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleCopyLink}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <Link 
            to={`/admin/products/${product.id}/edit`}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <Edit className="w-4 h-4" /> Edit Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-gray-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
             <div 
               className="relative group cursor-pointer"
               onClick={() => setImageModalOpen(true)}
             >
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full max-w-sm rounded-xl shadow-lg group-hover:scale-[1.02] transition-transform duration-300" 
               />
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-xl flex items-center justify-center">
                 <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-bold shadow-md">
                   Click to Expand
                 </span>
               </div>
             </div>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                {product.isSpicy && (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-100">
                    <Flame className="w-3 h-3" /> Spicy
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {product.brand}
                </span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                    {product.discountPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Status</p>
                  <p className={`font-medium ${product.stock > 10 ? 'text-gray-900' : 'text-red-600'}`}>
                    {product.stock} units available
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-medium text-gray-900">#{product.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium text-gray-900">{product.expiryDate || 'Not set'}</p>
                </div>
              </div>
            </div>
            
            {/* QR Code Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <QrCode className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">Share Product</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                      <img src={qrCodeUrl} alt="Product QR" className="w-32 h-32" />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-gray-900 mb-1">Product QR Code</p>
                        <p className="text-sm text-gray-500 mb-4">Scan this code to directly open the product's store page on any mobile device.</p>
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                          <a 
                              href={qrCodeUrl} 
                              download={`${product.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                          >
                              Download QR
                          </a>
                          <button 
                            onClick={() => window.open(productUrl, '_blank')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Preview Page
                          </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setImageModalOpen(false)}>
          <button 
            onClick={() => setImageModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-brand-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductView;