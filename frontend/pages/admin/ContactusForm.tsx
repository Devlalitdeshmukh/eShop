import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useStore } from '../../store';
import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Contactus } from '../../types';

const ContactusForm = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const isEdit = !!id;
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { updateContactus, addContactus } = useStore();

const [formData, setFormData] = useState<Partial<Contactus>>({
    title: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    instagram: '',
    facebook: '',
    linkedin: '',
  });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    useEffect(() => {
        const fetchContactusDetails = async () => {
            if (!isEdit) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/contactus/${id}`);
setFormData({
            title: data.title,
            description: data.description,
            email: data.email,
            phone: data.phone,
            address: data.address,
            instagram: data.instagram,
            facebook: data.facebook,
            linkedin: data.linkedin,
          });
            } catch (error) {
                console.warn("Failed to fetch contact us details");
                addToast("Failed to load details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchContactusDetails();
    }, [id, isEdit, addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
          if (isEdit) {
            await updateContactus(id!, formData);
            addToast('Contactus updated successfully', 'success');
          } else {
            await addContactus(formData);
            addToast('Contactus created successfully', 'success');
          }
          navigate('/admin/contactus');
        } catch (error) {
          addToast('Failed to save contactus. Please try again.', 'error');
        }
    };
 
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Contact Us' : 'Add Contact Us'}</h1>
                <p className="text-gray-500">Manage Contactus for your store.</p>
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
                
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="support@example.com" />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+1234567890" />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" value={formData.address || ''} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="123 Street..." />
                </div>

                {/* Social Media Links Section */}
                <div className="col-span-1 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media Links</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                            <input type="url" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://instagram.com/yourpage" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                            <input type="url" name="facebook" value={formData.facebook || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://facebook.com/yourpage" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                            <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://linkedin.com/company/yourpage" />
                        </div>
                    </div>
                </div>

            </div>
             
            <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2 transition-all disabled:opacity-50" disabled={uploading}>
              <Save className="w-5 h-5" /> Save Contact Us
            </button>
          </div>
        </form>
        </div>
    );
};

export default ContactusForm;