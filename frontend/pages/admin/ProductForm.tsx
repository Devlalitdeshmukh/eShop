import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Upload, Save, Calendar, Loader, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import brandCategoryService from '../../services/brandCategoryService';
import { ProductVariant } from '../../types';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useStore();
  const { addToast } = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '', // This will now hold the category ID
    brand: '',    // This will now hold the brand ID
    price: '',
    discountPrice: '',
    stock: '',
    description: '',
    image: '',
    isSpicy: false,
    isBestSelling: false,
    season: 'All' as 'Summer' | 'Winter' | 'Festival' | 'All',
    expiryDate: '',
    variants: [] as ProductVariant[]
  });

  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          brandCategoryService.getCategories(),
          brandCategoryService.getBrands()
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
        if (!isEdit) {
          setFormData(prev => ({
            ...prev,
            category: catRes.data[0]?.id?.toString() || '',
            brand: brandRes.data[0]?.id?.toString() || ''
          }));
        }
      } catch (error) {
        console.error('Failed to fetch categories/brands', error);
      }
    };
    fetchData();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit && products.length > 0) {
      const product = products.find(p => p.id === id);
      if (product) {
        // For edit mode, we need to find the matching category/brand ID based on name
        const category = categories.find(cat => cat.name === product.category);
        const brand = brands.find(b => b.name === product.brand);
        
        setFormData({
          name: product.name,
          category: category?.id?.toString() || product.category, // Use ID if available, fallback to name for backward compatibility
          brand: brand?.id?.toString() || product.brand,         // Use ID if available, fallback to name for backward compatibility
          price: product.price.toString(),
          discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
          stock: product.stock.toString(),
          description: product.description,
          image: product.image,
          isSpicy: product.isSpicy || false,
          isBestSelling: product.isBestSelling || false,
          season: product.season || 'All',
          expiryDate: product.expiryDate || '',
          variants: product.variants || []
        });
      }
    }
  }, [id, products, isEdit, categories, brands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert IDs back to names for the API call to maintain compatibility with the backend logic
    const brandName = brands.find(b => b.id === parseInt(formData.brand))?.name || formData.brand;
    const categoryName = categories.find(c => c.id === parseInt(formData.category))?.name || formData.category;
    
    const productData = {
      ...formData,
      brand: brandName,
      category: categoryName,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      stock: parseInt(formData.stock),
      variants: formData.variants.length > 0 ? formData.variants : undefined
    };

    try {
      if (isEdit) {
        await updateProduct(id!, productData);
        addToast('Product updated successfully', 'success');
      } else {
        await addProduct(productData);
        addToast('Product created successfully', 'success');
      }
      navigate('/admin/products');
    } catch (error) {
      addToast('Failed to save product. Please try again.', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: undefined,
      stock: 0
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const removeVariant = (vId: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== vId) }));
  };

  const updateVariant = (vId: string, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === vId ? { ...v, [field]: value } : v)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: `http://localhost:5000${data}` }));
      addToast('Image uploaded successfully', 'success');
    } catch (error) {
      addToast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/products')} className="flex items-center text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none">
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Base Stock</label>
               <input type="number" required name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select name="season" value={formData.season} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="All">All</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Festival">Festival</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
              <input type="number" required name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Discount Price (₹)</label>
              <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            {/* Variants Section */}
            <div className="col-span-2 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Product Variants (e.g. Size/Weight)</h3>
                <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg font-bold hover:bg-brand-100 transition-colors">
                  <Plus className="w-4 h-4" /> Add Variant
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.variants.map((v) => (
                  <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Variant Name</label>
                      <input 
                        placeholder="e.g. 500g Jar" 
                        value={v.name} 
                        onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (Optional)</label>
                      <input 
                        type="number" 
                        placeholder="Base price used if empty" 
                        value={v.price || ''} 
                        onChange={(e) => updateVariant(v.id, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                      <input 
                        type="number" 
                        value={v.stock} 
                        onChange={(e) => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => removeVariant(v.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.variants.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No variants added. This product will use its base price and stock.</p>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>

            <div className="col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isBestSelling"
                  checked={formData.isBestSelling}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Mark as Best Selling Product
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2 flex-shrink-0 border border-gray-300">
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" disabled={uploading} />
                  </label>
                </div>
                <input required name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
            </div>


          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 transition-all disabled:opacity-50" disabled={uploading}>
              <Save className="w-5 h-5" /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
