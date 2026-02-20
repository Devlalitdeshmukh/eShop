import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const Contactus = () => {
  const { contactus, refreshContactus, deleteContactus } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    refreshContactus();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteContactus(id.toString());
        addToast('Section deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete section', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Us Management</h1>
          <p className="text-gray-500">Manage content for the Contact Us page.</p>
        </div>
        <Link 
          to="/admin/contactus/new" 
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Section
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700 w-1/4">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
              <th className="px-6 py-4 font-semibold text-gray-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contactus.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No contact us sections found. Add one to get started.
                </td>
              </tr>
            ) : (
              contactus.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600 line-clamp-2">{item.description.substring(0, 100)}{item.description.length > 100 && '...'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate(`/admin/contactus/${item.id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contactus;
