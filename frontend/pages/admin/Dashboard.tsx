import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports');
        setData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mr-3"></div>
        Loading dashboard data...
      </div>
    );
  }

  const calculateChange = (current: any, previous: any) => {
    const cur = parseFloat(current);
    const prev = parseFloat(previous);
    if (!prev || prev === 0) return 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const revenueChange = calculateChange(data.summary.totalRevenue, data.summary.prevRevenue);
  const orderChange = calculateChange(data.summary.totalOrders, data.summary.prevOrders);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{parseFloat(data.summary.totalRevenue).toLocaleString()}</div>
          <div className={`text-sm flex items-center mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${revenueChange < 0 ? 'rotate-180' : ''}`} /> 
            {Math.abs(revenueChange)}% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalOrders}</div>
          <div className={`text-sm flex items-center mt-1 ${orderChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {orderChange >= 0 ? '+' : ''}{orderChange}% from last month
          </div>
        </div>
        
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalCustomers}</div>
           <div className="text-sm text-purple-600 flex items-center mt-1">
            +{data.summary.newCustomersToday} new today
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.summary.pendingOrders}</div>
          <div className="text-sm text-orange-600 mt-1">
             Needs attention
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => [`₹${value}`, 'Sales']} />
                <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Volume</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => [value, 'Orders']} />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;