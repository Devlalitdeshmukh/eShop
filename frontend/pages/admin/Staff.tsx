import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { staffService } from '../../services/staffService';
import { Trash2, Shield, Eye, UserCog, Calendar, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/admin/Pagination';

const AdminStaff = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [staff, setStaff] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  
  // New Holiday Form State
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', description: '', is_optional: false });

  const fetchStaff = async () => {
    try {
      const { data } = await api.get(`/users?roles=STAFF,COMPANY,ADMIN&page=${staffPage}&limit=10`);
      const staffMembers = Array.isArray(data) ? data : data.items || [];
      setStaff(staffMembers);
      setStaffTotalPages(Array.isArray(data) ? 1 : data.totalPages || 1);
    } catch (error) {
      console.warn("Failed to fetch staff");
    }
  };

  const fetchHolidays = async () => {
    try {
      const year = new Date().getFullYear();
      const { data } = await staffService.getHolidays(year);
      setHolidays(data);
    } catch (error) {
      console.warn("Failed to fetch holidays");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStaff(), fetchHolidays()]);
      setLoading(false);
    };
    init();
  }, [staffPage]);

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member? This cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        setStaff(staff.filter(s => s.id !== id));
        addToast('Staff member deleted', 'success');
      } catch (error) {
        addToast('Failed to delete staff member', 'error');
      }
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (window.confirm('Delete this holiday?')) {
      try {
        await staffService.deleteHoliday(id);
        setHolidays(holidays.filter(h => h.id !== id));
        addToast('Holiday deleted', 'success');
      } catch (error) {
        addToast('Failed to delete holiday', 'error');
      }
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffService.createHoliday(newHoliday);
      addToast('Holiday added successfully', 'success');
      setShowHolidayModal(false);
      setNewHoliday({ name: '', date: '', description: '', is_optional: false });
      fetchHolidays();
    } catch (error) {
      addToast('Failed to add holiday', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">View and manage staff, attendance, and holidays.</p>
        </div>
        {activeTab === 'holidays' && (
          <button 
            onClick={() => setShowHolidayModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Holiday
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-6 pt-4">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('list')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'list' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <UserCog className="w-4 h-4" /> Staff List
          </button>
          <button 
            onClick={() => setActiveTab('holidays')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'holidays' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Calendar className="w-4 h-4" /> Holidays
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {/* STAFF LIST TAB */}
            {activeTab === 'list' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-medium">Staff Member</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium text-center">Orders</th>
                      <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50/80 transition-all">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-black font-serif">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 leading-none mb-1">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 focus-within:z-10">
                          {member.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-100 shadow-sm">
                              <Shield className="w-3 h-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-100 shadow-sm">
                              <UserCog className="w-3 h-3" /> STAFF
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className="inline-block px-3 py-1 bg-gray-50 rounded-lg text-sm font-black text-gray-700 border border-gray-100">
                            {member.totalOrders || 0}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-gray-900">
                          ₹{parseFloat((member.totalAmount || 0).toString()).toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-xl">
                            <Link 
                              to={`/admin/staff/${member.id}`}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                              title="View Profile"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {member.role !== 'ADMIN' && (
                              <button 
                                onClick={() => handleDeleteStaff(member.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Delete Staff Member"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <Pagination page={staffPage} totalPages={staffTotalPages} onPageChange={setStaffPage} />
              </div>
            )}

            {/* HOLIDAYS TAB */}
            {activeTab === 'holidays' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {holidays.map(holiday => (
                    <div key={holiday.id} className="p-6 border border-gray-200 rounded-2xl hover:border-brand-200 transition-colors bg-gray-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-600 border border-gray-100">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <button 
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{holiday.name}</h3>
                      <p className="text-gray-500 text-sm mb-4">{new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      
                      {holiday.description && (
                         <div className="p-3 bg-white rounded-lg text-sm text-gray-600 border border-gray-100 mb-3">
                            {holiday.description}
                         </div>
                      )}
                      
                      {holiday.is_optional ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Optional Holiday
                         </span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public Holiday
                         </span>
                      )}
                    </div>
                  ))}
                  
                  {/* Add New Card Button */}
                  <button 
                    onClick={() => setShowHolidayModal(true)}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-brand-600 min-h-[200px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                       <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Add New Holiday</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-t-3xl p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Add New Holiday</h3>
                </div>
                <button 
                  onClick={() => setShowHolidayModal(false)} 
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleAddHoliday} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Holiday Name
                </label>
                <input 
                  type="text" 
                  required
                  value={newHoliday.name}
                  onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="e.g. Diwali, Independence Day"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Date
                </label>
                <input 
                  type="date" 
                  required
                  value={newHoliday.date}
                  onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Description <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea 
                  value={newHoliday.description}
                  onChange={e => setNewHoliday({...newHoliday, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Brief details regarding this holiday..."
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    id="isOptional"
                    checked={newHoliday.is_optional}
                    onChange={e => setNewHoliday({...newHoliday, is_optional: e.target.checked})}
                    className="w-5 h-5 text-brand-600 border-gray-300 rounded-lg focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Mark as optional holiday
                  </span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
