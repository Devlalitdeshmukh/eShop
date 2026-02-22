import React, { useEffect, useState } from "react";
import { Download, IndianRupee, Receipt, ShoppingCart } from "lucide-react";
import api from "../../services/api";

const RevenueTracker = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await api.get("/orders/revenue-tracker");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch revenue tracker", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const downloadInvoice = async (id: string | number, orderNo: string) => {
    const response = await api.get(`/orders/${id}/invoice`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${orderNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-gray-500">Loading revenue tracker...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Tracker</h1>
        <p className="text-gray-500">Total, monthly revenue and downloadable order invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <IndianRupee className="w-5 h-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">â‚¹{Number(data?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">â‚¹{Number(data?.monthlyRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Orders Count</p>
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{Number(data?.totalOrders || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Order No</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.recentOrders || []).map((order: any) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-semibold">{order.order_no}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 font-semibold">â‚¹{Number(order.totalPrice || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">{order.status}</td>
                  <td className="px-5 py-4">{order.paymentMethod || "-"}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => downloadInvoice(order.id, order.order_no)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueTracker;
