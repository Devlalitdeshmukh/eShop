import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';
import brandCategoryService from '../../services/brandCategoryService';

interface Category {
  id: number;
  name: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data } = await brandCategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      addToast('Failed to fetch categories', 'error');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      await brandCategoryService.createCategory({ name: newCategory });
      setNewCategory('');
      fetchCategories();
      addToast('Category added successfully', 'success');
    } catch (error) {
      addToast('Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await brandCategoryService.updateCategory(id.toString(), { name: editingName });
      setEditingId(null);
      fetchCategories();
      addToast('Category updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await brandCategoryService.deleteCategory(id.toString());
        fetchCategories();
        addToast('Category deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete category', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-500">Manage product categories for your store.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category Name"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none w-full max-w-md"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{category.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === category.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;