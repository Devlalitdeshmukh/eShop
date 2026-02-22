import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '../services/api';
import PageHero from '../components/PageHero';

const PrivacyPolicy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data } = await api.get('/privacy');
        setContent(data.content || 'Privacy policy content not available.');
      } catch (error) {
        console.error('Failed to fetch privacy policy', error);
        setContent('Privacy policy content not available.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Privacy Policy"
        subtitle="Your privacy is important to us."
        imageUrl="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80"
      />

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <FileText className="w-6 h-6 text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Privacy Policy</h2>
          </div>
          
          <div 
            className="prose prose-gray max-w-none"
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              color: '#374151'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
