import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { useToast } from '../../context/ToastContext';
import { Edit, Trash2, Plus, Flame, Eye } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/admin/Pagination';

const AdminProducts = () => {
  const { deleteProduct, refreshProducts } = useStore();
  const { addToast } = useToast();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products?page=${page}&limit=10`);
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
      } else {
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      addToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, page]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await fetchProducts();
        addToast('Product deleted successfully', 'success');
      } catch {
        addToast('Failed to delete product', 'error');
      }
    }
  };

  const toggleBestSeller = async (id: string, current: boolean) => {
    try {
      await api.put(`/products/${id}/best-selling`, { isBestSelling: !current });
      await refreshProducts();
      await fetchProducts();
      addToast('Best selling status updated', 'success');
    } catch {
      addToast('Failed to update best selling status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500">Add, edit or remove products from your catalog.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Attributes</th>
                  <th className="px-6 py-4 font-medium">Sales</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {product.discountPrice ? (
                        <div>
                          <span className="text-red-600">₹{product.discountPrice}</span>
                          <span className="text-gray-400 text-xs line-through ml-1">₹{product.price}</span>
                        </div>
                      ) : (
                        `₹${product.price}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.isSpicy && (
                          <span title="Spicy">
                            <Flame className="w-4 h-4 text-brand-500" />
                          </span>
                        )}
                        <button
                          onClick={() => toggleBestSeller(product.id, Boolean(product.isBestSelling))}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            product.isBestSelling
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {product.isBestSelling ? 'Best Seller' : 'Mark Best'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">{product.totalSales || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminProducts;
