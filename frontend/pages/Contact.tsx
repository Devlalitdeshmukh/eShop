import React from 'react';
import { useStore } from '../store';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Contact = () => {
  const { contactus, products } = useStore();
  const { addToast } = useToast();
  const contactInfo = contactus[0];
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    inquiry_type: 'Product',
    product_id: '',
    message: '',
  });

  // Extract address for Google Maps
  const mapAddress = contactInfo?.address || 'India';
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(mapAddress)}`;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        ...form,
        product_id: form.product_id ? Number(form.product_id) : null,
      });
      addToast('Inquiry submitted successfully', 'success');
      setForm({
        name: '',
        email: '',
        phone: '',
        inquiry_type: 'Product',
        product_id: '',
        message: '',
      });
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Failed to submit inquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Get In Touch"
        subtitle="We'd love to hear from you. Reach out to us anytime."
        imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                {contactInfo?.description || 'Feel free to reach out to us through any of the following channels.'}
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo?.email && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                      <a href={`mailto:${contactInfo.email}`} className="text-brand-600 hover:text-brand-700 transition-colors">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {contactInfo?.phone && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                      <a href={`tel:${contactInfo.phone}`} className="text-brand-600 hover:text-brand-700 transition-colors">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {contactInfo?.address && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">{contactInfo.address}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Send Inquiry</h3>
              </div>
              <form onSubmit={submitInquiry} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <input name="name" value={form.name} onChange={onChange} required className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} required className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Inquiry Type</label>
                  <select name="inquiry_type" value={form.inquiry_type} onChange={onChange} className="w-full border border-gray-300 rounded-lg p-3">
                    <option value="Product">Product</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Price">Price</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {form.inquiry_type === 'Product' && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Product (Optional)</label>
                    <select name="product_id" value={form.product_id} onChange={onChange} className="w-full border border-gray-300 rounded-lg p-3">
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                  <textarea name="message" value={form.message} onChange={onChange} required rows={5} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div className="md:col-span-2">
                  <button disabled={submitting} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-60">
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-brand-600 to-brand-700">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Find Us Here
            </h3>
          </div>
          <div className="relative" style={{ height: '420px' }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
              title="Google Maps Location"
            />
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600 text-sm">Handmade with authentic ingredients</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick and reliable shipping</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💯</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">100% Satisfaction</h3>
              <p className="text-gray-600 text-sm">Customer happiness guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
