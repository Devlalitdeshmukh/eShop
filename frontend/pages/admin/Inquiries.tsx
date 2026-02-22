import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Pagination from "../../components/admin/Pagination";

type InquiryStatus = "New" | "Working" | "Resolved" | "Completed";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: "Product" | "Delivery" | "Price" | "Other";
  product_name?: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

const statuses: InquiryStatus[] = ["New", "Working", "Resolved", "Completed"];

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const queryParts = [`page=${page}`, "limit=10"];
      if (statusFilter) queryParts.push(`status=${encodeURIComponent(statusFilter)}`);
      const query = `?${queryParts.join("&")}`;
      const { data } = await api.get(`/inquiries${query}`);
      if (Array.isArray(data)) {
        setInquiries(data);
        setTotalPages(1);
      } else {
        setInquiries(Array.isArray(data.items) ? data.items : []);
        setTotalPages(data.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, page]);

  const updateStatus = async (id: number, status: InquiryStatus) => {
    await api.put(`/inquiries/${id}/status`, { status });
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-500">Track and resolve customer inquiries.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inquiries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((i) => (
                  <tr key={i.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{i.name}</div>
                      <div className="text-xs text-gray-500">{i.email}</div>
                      {i.phone && <div className="text-xs text-gray-500">{i.phone}</div>}
                    </td>
                    <td className="px-6 py-4">{i.inquiry_type}</td>
                    <td className="px-6 py-4">{i.product_name || "-"}</td>
                    <td className="px-6 py-4 max-w-sm text-sm text-gray-700">{i.message}</td>
                    <td className="px-6 py-4">
                      <select
                        value={i.status}
                        onChange={(e) => updateStatus(i.id, e.target.value as InquiryStatus)}
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(i.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminInquiries;
