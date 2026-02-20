import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useStore } from '../../store';
import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Aboutus } from '../../types';

const AboutusForm = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const isEdit = !!id;
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { updateAboutus, addAboutus } = useStore();

    const [formData, setFormData] = useState<Partial<Aboutus>>({
        title: '',
        description: '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    useEffect(() => {
        const fetchAboutusDetails = async () => {
            if (!isEdit) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/aboutus/${id}`);
                setFormData({
                    title: data.title,
                    description: data.description,
                });
            } catch (error) {
                console.warn("Failed to fetch about us details");
                addToast("Failed to load details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAboutusDetails();
    }, [id, isEdit, addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
          if (isEdit) {
            await updateAboutus(id!, formData);
            addToast('Aboutus updated successfully', 'success');
          } else {
            await addAboutus(formData);
            addToast('Aboutus created successfully', 'success');
          }
          navigate('/admin/aboutus');
        } catch (error) {
          addToast('Failed to save aboutus. Please try again.', 'error');
        }
    };
 
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit About Us' : 'Add About Us'}</h1>
                <p className="text-gray-500">Manage Aboutus for your store.</p>
              </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input required name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>

            </div>
             
            <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 transition-all disabled:opacity-50" disabled={uploading}>
              <Save className="w-5 h-5" /> Save About Us
            </button>
          </div>
        </form>
        </div>
    );
};

export default AboutusForm;