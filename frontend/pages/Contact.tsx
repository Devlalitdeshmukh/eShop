import React from 'react';
import { useStore } from '../store';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const { contactus } = useStore();
  const contactInfo = contactus[0];

  // Extract address for Google Maps
  const mapAddress = contactInfo?.address || 'India';
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(mapAddress)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Get In Touch</h1>
          <p className="text-xl text-brand-100">We'd love to hear from you. Reach out to us anytime!</p>
        </div>
      </div>

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

          {/* Google Map */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-brand-600 to-brand-700">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Find Us Here
                </h3>
              </div>
              <div className="relative" style={{ height: '500px' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapUrl}
                  title="Google Maps Location"
                ></iframe>
              </div>
            </div>
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
