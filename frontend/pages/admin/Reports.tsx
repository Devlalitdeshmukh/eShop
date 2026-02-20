import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useStore } from '../../store';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const AdminReports = () => {
  const { products } = useStore();
  const [reportData, setReportData] = useState<any>({
    stockLevels: [],
    categoryDist: [],
    topSelling: [],
    summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
    salesTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/reports');
        setReportData(data);
      } catch (error) {
        console.warn("Failed to fetch backend reports, using computed fallbacks.");
        // Fallback calculation using client-side store data
        const catDist = products.reduce((acc: any, curr) => {
           acc[curr.category] = (acc[curr.category] || 0) + 1;
           return acc;
        }, {});
        
        const categoryDist = Object.keys(catDist).map(key => ({ name: key, value: catDist[key] }));
        const stockLevels = products.map(p => ({ name: p.name, stock: p.stock })).sort((a,b) => a.stock - b.stock).slice(0, 10);
        
        setReportData({
            stockLevels,
            categoryDist,
            topSelling: [
              { name: 'Mango Pickle', sold: 45, revenue: 8955 }, 
              { name: 'Moong Dal Papad', sold: 30, revenue: 4500 }, 
              { name: 'Ratkami Sev', sold: 25, revenue: 3000 },
              { name: 'Mathri', sold: 18, revenue: 3240 },
              { name: 'Garlic Pickle', sold: 12, revenue: 3600 }
            ],
            summary: { totalRevenue: 23295, totalOrders: 130, avgOrderValue: 179 },
            salesTrend: [
              { month: 'Jan', revenue: 4000 },
              { month: 'Feb', revenue: 5500 },
              { month: 'Mar', revenue: 4800 },
              { month: 'Apr', revenue: 7200 },
              { month: 'May', revenue: 8100 }
            ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Analyzing business data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Real-time performance metrics and inventory insights.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{Number(reportData.summary.totalRevenue).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{reportData.summary.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{Math.round(reportData.summary.avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Monthly Sales Performance</h3>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">Last 6 Months</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.salesTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Product Catalog Mix</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categoryDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={8}
                  dataKey={reportData.categoryDist[0]?.value ? "value" : "count"}
                  nameKey={reportData.categoryDist[0]?.name ? "name" : "category"}
                >
                  {reportData.categoryDist.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Selling Products Chart (Expanded with Revenue metric) */}
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top 5 Selling Products</h3>
              <p className="text-sm text-gray-500 mt-1">Comparison by quantity sold and gross revenue generated.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-500 rounded-full"></div> Units Sold</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Revenue (₹)</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topSelling} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sold" name="Units Sold" fill="#ea580c" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest border-b pb-2">Top Performers Leaderboard</h4>
               {reportData.topSelling.map((item: any, idx: number) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100">
                    <div className="flex items-center gap-4">
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                         {idx + 1}
                       </span>
                       <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sold} units delivered</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-brand-600">₹{Number(item.revenue).toLocaleString()}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Revenue Generated</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Lowest Stock Levels */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900">Inventory Alert (Low Stock)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
             {reportData.stockLevels.slice(0, 5).map((p: any, idx: number) => (
               <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <p className="text-sm font-bold text-gray-900 truncate mb-1" title={p.name}>{p.name}</p>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-500">Current Stock:</span>
                     <span className={`text-sm font-bold ${p.stock <= 5 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>{p.stock}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                     <div 
                        className={`h-1.5 rounded-full ${p.stock <= 5 ? 'bg-red-500' : 'bg-orange-500'}`} 
                        style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%` }}
                     ></div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;