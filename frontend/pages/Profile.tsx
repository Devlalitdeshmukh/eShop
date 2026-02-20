import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import api from '../services/api';
import { User, Mail, Phone, Shield, Calendar, MapPin, Package, Settings, LogOut, X, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, logout, setAuthUser, isLoading: storeLoading } = useStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, savedAddresses: 0, accountStatus: 'Active' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: ''
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/profile');
      setStats({
        totalOrders: data.totalOrders || 0,
        savedAddresses: data.savedAddresses || 0,
        accountStatus: data.accountStatus || 'Active'
      });
      // Ensure local form data is synced with latest user data
      setFormData({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        gender: data.gender || ''
      });
      // Optionally update store user to ensure consistency, BUT preserve the token
      if (setAuthUser && user?.token) {
          setAuthUser({ ...data, token: user.token });
      }
    } catch (error: any) {
      console.error("Failed to fetch profile", error);
      if (error.response && error.response.status === 401) {
          logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', formData);
      setAuthUser(data); // Update global store
      setIsEditing(false);
      fetchProfileData(); // Refresh stats/data
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    }
  };

  if (storeLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) return <div className="text-center py-12">Please login to view your profile</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-brand-600 to-brand-800 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg p-1">
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-brand-600 text-4xl font-bold font-serif">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {user.role}
                </span>
                • {user.created_at ? `Member since ${new Date(user.created_at).toLocaleDateString()}` : 'Member since Oct 2023'}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-brand-500" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-brand-500" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone Number</p>
                    <p className="font-medium">{user.mobile || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-brand-500" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-brand-500" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gender</p>
                    <p className="font-medium">{user.gender || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.savedAddresses}</p>
            <p className="text-sm text-gray-500">Saved Addresses</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 capitalize">{stats.accountStatus}</p>
            <p className="text-sm text-gray-500">Account Status</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                    <p className="text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setShowLogoutConfirm(false)}
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                logout();
                                setShowLogoutConfirm(false);
                            }}
                            className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Yes, Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
