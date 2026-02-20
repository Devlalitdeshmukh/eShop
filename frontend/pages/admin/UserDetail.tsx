import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Shield, Calendar, ShoppingBag, DollarSign, Eye, Star, MessageSquare } from 'lucide-react';
import api from '../../services/api';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  product_id: number;
  product_name: string;
  product_image: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  role: string;
  isAdmin: boolean;
  created_at: string;
  totalOrders: number;
  totalAmount: number;
  orders: any[];
  reviews: Review[];
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mb-4"></div>
      Loading user profile...
    </div>
  );
  
  if (!user) return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
      <Link to="/admin/users" className="text-brand-600 hover:underline">Back to Users</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <div className="flex items-center justify-between">
        <Link to="/admin/users" className="flex items-center text-gray-500 hover:text-brand-600 transition-colors text-sm font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Users
        </Link>
        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-brand-600 to-brand-800 p-8 flex items-end">
          <div className="flex items-center gap-6 translate-y-12">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl p-1">
              <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-brand-600 text-3xl font-black font-serif border border-gray-100">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
              <p className="text-white/80 font-medium">Customer ID: #{user.id}</p>
            </div>
          </div>
        </div>
        
        <div className="px-8 pt-20 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Mail className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Email Address</p>
                    <p className="font-bold text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Phone className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Phone Number</p>
                    <p className="font-bold text-gray-900">{user.mobile || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Calendar className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Joined On</p>
                    <p className="font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                   <div className="p-2 bg-white rounded-lg shadow-sm"><Shield className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Gender</p>
                    <p className="font-bold text-gray-900 capitalize">{user.gender || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-brand-600" />
                Recent Orders
              </h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {user.orders && user.orders.length > 0 ? user.orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{order.order_no}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{parseFloat(order.totalPrice).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/admin/orders/${order.id}`} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg inline-block">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-600" />
                Customer Reviews ({user.reviews?.length || 0})
              </h2>
              <div className="space-y-4">
                {user.reviews && user.reviews.length > 0 ? user.reviews.map(review => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <Link to={`/products/${review.product_id}`} className="flex-shrink-0">
                        <img 
                          src={review.product_image} 
                          alt={review.product_name}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                      </Link>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link 
                              to={`/products/${review.product_id}`}
                              className="font-bold text-gray-900 hover:text-brand-600 transition-colors"
                            >
                              {review.product_name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-sm font-bold text-gray-700">{review.rating}.0</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-sm mt-1">This customer hasn't written any product reviews.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100 space-y-2">
              <div className="flex items-center gap-2 text-brand-700">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Total Orders</span>
              </div>
              <p className="text-4xl font-black text-brand-900">{user.totalOrders || 0}</p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <DollarSign className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Total Spent</span>
              </div>
              <p className="text-4xl font-black text-green-900">₹{parseFloat((user.totalAmount || 0).toString()).toLocaleString()}</p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 space-y-2">
              <div className="flex items-center gap-2 text-yellow-700">
                <Star className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Reviews Written</span>
              </div>
              <p className="text-4xl font-black text-yellow-900">{user.reviews?.length || 0}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Status</h3>
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Active Account
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
