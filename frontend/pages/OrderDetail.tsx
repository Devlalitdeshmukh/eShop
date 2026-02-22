import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, Truck, CreditCard, Calendar, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  qty: number;
  image: string;
  price: number;
}

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  total: number;
  totalPrice?: number;
  status: string;
  payment_method: string;
  paymentMethod?: string;
  shipping_address: any;
  shippingAddress?: any;
  created_at: string;
  items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { addToast } = useToast();

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order', error);
      addToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrder(); // Refresh data
    } catch (error) {
      console.error('Failed to update status', error);
      addToast('Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mb-4"></div>
      Loading order details...
    </div>
  );

  if (!order) return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
      <Link to="/admin/orders" className="text-brand-600 hover:underline">Back to Orders</Link>
    </div>
  );

  // Handle address parsing
  let address: any = {};
  try {
    const rawAddress = order.shipping_address || order.shippingAddress;
    address = typeof rawAddress === 'string' ? JSON.parse(rawAddress) : (rawAddress || {});
  } catch (e) {
    console.error('Failed to parse address', e);
  }

  const orderTotal = order.total || order.totalPrice || 0;
  const payMethod = order.payment_method || order.paymentMethod || 'N/A';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/admin/orders" className="flex items-center text-gray-500 hover:text-brand-600 transition-colors text-sm font-medium mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_no || `#${order.id}`}</h1>
          <p className="text-gray-500 text-sm">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Download Invoice (PDF)
          </button>
          <div className="text-right mr-2 hidden md:block">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
            <p className="font-bold text-gray-900">{order.status}</p>
          </div>
          <select 
            disabled={updating}
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" />
                <h2 className="font-bold text-gray-900">Order Items</h2>
              </div>
              <span className="text-sm text-gray-500 font-medium">{order.items.length} items</span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.qty).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 font-medium">₹{parseFloat(item.price.toString()).toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(orderTotal.toString()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900 text-xl">Total Amount</span>
                  <span className="font-black text-brand-600 text-3xl">₹{parseFloat(orderTotal.toString()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-brand-600" />
              Customer Information
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">User ID</span>
                <span className="font-medium text-gray-900">#{order.user_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{address.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">{address.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-3">
              <Truck className="w-5 h-5 text-brand-600" />
              Delivery Address
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-1">{address.name}</p>
              <p>{address.address}</p>
              <p>{address.city}{address.pincode ? `, ${address.pincode}` : ''}</p>
              <p>{address.country || 'India'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-3">
              <CreditCard className="w-5 h-5 text-brand-600" />
              Payment Details
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900 uppercase">{payMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1 font-bold ${order.status === 'Paid' || order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                  {(order.status === 'Paid' || order.status === 'Delivered') && <CheckCircle className="w-3 h-3" />}
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
