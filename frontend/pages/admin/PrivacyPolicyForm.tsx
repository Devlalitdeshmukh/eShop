import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PrivacyPolicyForm = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data } = await api.get('/privacy');
        setContent(data.content || '');
      } catch (error) {
        console.error('Failed to fetch privacy policy', error);
      }
    };
    fetchPolicy();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/privacy', { content });
      addToast('Privacy Policy updated successfully', 'success');
      navigate('/admin');
    } catch (error: any) {
      console.error('Privacy Policy Update Error:', error.response?.data || error.message);
      addToast('Failed to update privacy policy', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-brand-600" />
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-1">Manage your website's privacy policy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Privacy Policy Content
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 font-mono text-sm"
              placeholder="Enter your privacy policy content here..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: You can use plain text or basic HTML formatting
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Privacy Policy'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrivacyPolicyForm;
