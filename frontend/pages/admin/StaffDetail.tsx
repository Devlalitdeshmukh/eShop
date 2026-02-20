import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Shield, Calendar, ShoppingBag, Star, MessageSquare, Clock, CheckCircle, XCircle, Briefcase, Settings, Plus, Save, User as UserIcon, FileText } from 'lucide-react';
import api from '../../services/api';
import { staffService } from '../../services/staffService';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../store';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  product_id: number;
  product_name: string;
  product_image: string;
}

interface StaffProfile {
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

const StaffDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useStore();
  const { addToast } = useToast();
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'leaves' | 'settings'>('profile');
  
  // HR Data States
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  
  // Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: ''
  });
  
  // New Attendance Form State
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    check_in_h: '09',
    check_in_m: '00',
    check_in_p: 'AM',
    check_out_h: '06',
    check_out_m: '00',
    check_out_p: 'PM',
    status: 'Present',
    notes: ''
  });

  // Leave Form State
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_name: '',
    work_handover_to: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    from_leave_type: 'Full Day',
    to_leave_type: 'Full Day',
    leave_reason: '',
    notes: '',
    document_url: ''
  });

  // Loading States
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/users/${id}`);
        setStaff(data);
        // Populate edit form
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          gender: data.gender || ''
        });
      } catch (error) {
        console.error('Failed to fetch staff member', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  // Fetch HR data when tabs change
  useEffect(() => {
    if (!id || !staff) return;

    if (activeTab === 'attendance') {
      fetchAttendanceData();
    } else if (activeTab === 'leaves') {
      fetchLeaveData();
    } else if (activeTab === 'settings') {
      fetchSettingsData();
    }
  }, [activeTab, id, staff]);

  const fetchAttendanceData = async () => {
    setLoadingAttendance(true);
    try {
      const now = new Date();
      const stats = await staffService.getAttendanceStats(id!, now.getMonth() + 1, now.getFullYear());
      setAttendanceStats(stats.data);
      
      const logs = await staffService.getAttendance(id!);
      setAttendance(logs.data);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchLeaveData = async () => {
    setLoadingLeaves(true);
    try {
      const balance = await staffService.getLeaveBalance(id!, new Date().getFullYear());
      setLeaveBalance(balance.data);
      
      const leaveList = await staffService.getLeaves(id!);
      setLeaves(leaveList.data);
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const fetchSettingsData = async () => {
    setLoadingSettings(true);
    try {
      const hours = await staffService.getWorkingHours(id!);
      if (hours.data.length === 0) {
        // Initialize default hours if none exist
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const defaults = days.map(day => ({
          day_of_week: day,
          start_time: '09:00:00',
          end_time: '18:00:00',
          is_working_day: day !== 'Sunday'
        }));
        setWorkingHours(defaults);
      } else {
        setWorkingHours(hours.data);
      }
    } catch (error) {
      console.error("Failed to fetch working hours", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleUpdateLeaveStatus = async (leaveId: string, status: string) => {
    try {
      if (!currentUser) return;
      await staffService.updateLeaveStatus(leaveId, status, currentUser.id.toString());
      addToast(`Leave request ${status.toLowerCase()}`, 'success');
      fetchLeaveData();
    } catch (error) {
      addToast('Failed to update leave status', 'error');
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      await Promise.all(workingHours.map(wh => 
        staffService.setWorkingHours({
          user_id: id,
          ...wh
        })
      ));
      addToast('Working hours updated successfully', 'success');
      fetchSettingsData();
    } catch (error) {
      addToast('Failed to update working hours', 'error');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    // Helper to convert 12h to 24h string
    const to24h = (h: string, m: string, p: string) => {
      let hours = parseInt(h);
      if (p === 'PM' && hours < 12) hours += 12;
      if (p === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${m}:00`;
    };

    const check_in = to24h(attendanceForm.check_in_h, attendanceForm.check_in_m, attendanceForm.check_in_p);
    const check_out = to24h(attendanceForm.check_out_h, attendanceForm.check_out_m, attendanceForm.check_out_p);
    const working_hours = calculateHours(check_in, check_out);

    try {
      await staffService.markAttendance({
        user_id: id,
        date: attendanceForm.date,
        check_in,
        check_out,
        status: attendanceForm.status,
        notes: attendanceForm.notes,
        working_hours
      });
      addToast('Attendance marked successfully', 'success');
      setShowAttendanceForm(false);
      setAttendanceForm({
        date: new Date().toISOString().split('T')[0],
        check_in_h: '09',
        check_in_m: '00',
        check_in_p: 'AM',
        check_out_h: '06',
        check_out_m: '00',
        check_out_p: 'PM',
        status: 'Present',
        notes: ''
      });
      fetchAttendanceData();
    } catch (error) {
      addToast('Failed to mark attendance', 'error');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffService.applyLeave({
        user_id: id,
        ...leaveForm
      });
      addToast('Leave request submitted successfully', 'success');
      setShowLeaveForm(false);
      setLeaveForm({
        leave_name: '',
        work_handover_to: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        from_leave_type: 'Full Day',
        to_leave_type: 'Full Day',
        leave_reason: '',
        notes: '',
        document_url: ''
      });
      fetchLeaveData();
      fetchLeaveData();
    } catch (error: any) {
      console.error('Submit Leave Error:', error);
      addToast(error.response?.data?.message || 'Failed to submit leave request', 'error');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/users/${id}`, editForm);
      addToast('Staff profile updated successfully', 'success');
      setIsEditingProfile(false);
      // Refresh staff data
      const { data } = await api.get(`/users/${id}`);
      setStaff(data);
    } catch (error) {
      addToast('Failed to update staff profile', 'error');
    }
  };

  const formatTime12Hour = (timeString: string) => {
    if (!timeString) return '-';
    // Check if it's already in 12h format or just handle the HH:mm:ss
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minutes} ${suffix}`;
  };

  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut || checkIn === '00:00:00' || checkOut === '00:00:00') return '-';
    
    // Create dates to calculate difference
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    
    let diff = end.getTime() - start.getTime();
    
    // Handle overnight (if check-out is next day)
    if (diff <= 0) {
      diff += 24 * 60 * 60 * 1000;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleWorkingHourChange = (index: number, field: string, value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mb-4"></div>
      Loading staff profile...
    </div>
  );
  
  if (!staff) return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Member Not Found</h2>
      <Link to="/admin/staff" className="text-brand-600 hover:underline">Back to Staff</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/admin/staff" className="flex items-center text-gray-500 hover:text-brand-600 transition-colors text-sm font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Staff
        </Link>
        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
            staff.role === 'ADMIN' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {staff.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-2xl border-b border-gray-200 px-6 pt-4">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Shield className="w-4 h-4" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attendance' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Clock className="w-4 h-4" /> Attendance
          </button>
          <button 
            onClick={() => setActiveTab('leaves')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'leaves' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Briefcase className="w-4 h-4" /> Leaves
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 p-6 min-h-[500px]">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-end">
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditForm({
                        name: staff?.name || '',
                        email: staff?.email || '',
                        mobile: staff?.mobile || '',
                        gender: staff?.gender || ''
                      });
                    }}
                    className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="text-center p-6 border border-gray-100 rounded-2xl bg-gray-50">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full p-1 shadow-md mb-4">
                    <div className="w-full h-full bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-4xl font-black font-serif">
                      {(isEditingProfile ? editForm.name : (staff?.name || ' ')).charAt(0)}
                    </div>
                  </div>
                  {!isEditingProfile ? (
                    <>
                      <h2 className="text-xl font-bold text-gray-900">{staff?.name}</h2>
                      <p className="text-gray-500 text-sm mt-1">{staff?.email}</p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                    {!isEditingProfile ? (
                      <p className="font-medium text-gray-900">{staff?.mobile || 'Not provided'}</p>
                    ) : (
                      <input
                        type="tel"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="Enter phone number"
                      />
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Joined On</p>
                    <p className="font-medium text-gray-900">{staff ? new Date(staff.created_at).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gender</p>
                    {!isEditingProfile ? (
                      <p className="font-medium text-gray-900 capitalize">{staff?.gender || 'Not specified'}</p>
                    ) : (
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-2xl font-black text-blue-900">{staff?.totalOrders || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-black text-green-900">₹{parseFloat((staff?.totalAmount || 0).toString()).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider mb-1">Reviews</p>
                    <p className="text-2xl font-black text-yellow-900">{staff?.reviews?.length || 0}</p>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase font-bold">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {staff?.orders?.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td className="py-3 font-medium text-gray-900">{order.order_no}</td>
                          <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">{order.status}</span>
                          </td>
                          <td className="py-3 text-right font-medium">₹{parseFloat(order.totalPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                      {(!staff?.orders || staff.orders.length === 0) && (
                        <tr><td colSpan={4} className="py-4 text-center text-gray-400">No orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAttendanceForm(!showAttendanceForm)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> {showAttendanceForm ? 'Cancel' : 'Mark Attendance'}
              </button>
            </div>

            {showAttendanceForm && (
              <form onSubmit={handleMarkAttendance} className="bg-white rounded-2xl border-2 border-brand-100 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Mark Manual Attendance
                  </h3>
                  <p className="text-brand-100 text-sm mt-1">Record attendance for {staff?.name}</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 z-10" />
                        <input 
                          type="date" 
                          required
                          value={attendanceForm.date}
                          onChange={e => setAttendanceForm({...attendanceForm, date: e.target.value})}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>
                    {/* Check In Time 12-Hour Selector */}
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Check In Time (12H)
                      </label>
                      <div className="flex gap-1 items-center">
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500"
                          value={attendanceForm.check_in_h || '09'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_in_h: e.target.value})}
                        >
                          {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="font-bold">:</span>
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500"
                          value={attendanceForm.check_in_m || '00'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_in_m: e.target.value})}
                        >
                          {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500 bg-gray-50 font-bold"
                          value={attendanceForm.check_in_p || 'AM'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_in_p: e.target.value})}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Check Out Time 12-Hour Selector */}
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Check Out Time (12H)
                      </label>
                      <div className="flex gap-1 items-center">
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500"
                          value={attendanceForm.check_out_h || '06'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_out_h: e.target.value})}
                        >
                          {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="font-bold">:</span>
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500"
                          value={attendanceForm.check_out_m || '00'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_out_m: e.target.value})}
                        >
                          {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-brand-500 bg-gray-50 font-bold"
                          value={attendanceForm.check_out_p || 'PM'}
                          onChange={e => setAttendanceForm({...attendanceForm, check_out_p: e.target.value})}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Status *</label>
                      <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 z-10" />
                        <select 
                          value={attendanceForm.status}
                          onChange={e => setAttendanceForm({...attendanceForm, status: e.target.value})}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Late">Late</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Notes (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                      <input 
                        type="text" 
                        value={attendanceForm.notes}
                        onChange={e => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="e.g. Worked overtime"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowAttendanceForm(false)}
                    className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            )}

            {loadingAttendance ? (
              <div className="text-center py-12 text-gray-400">Loading attendance data...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-xl bg-green-50 border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Present Days</p>
                    <p className="text-2xl font-black text-green-900">{attendanceStats?.present_days || 0}</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-red-50 border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Absent Days</p>
                    <p className="text-2xl font-black text-red-900">{attendanceStats?.absent_days || 0}</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-orange-50 border-orange-100">
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Late Arrivals</p>
                    <p className="text-2xl font-black text-orange-900">{attendanceStats?.late_days || 0}</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-blue-50 border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Days</p>
                    <p className="text-2xl font-black text-blue-900">{attendanceStats?.total_days || 0}</p>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Check In</th>
                        <th className="px-4 py-3">Check Out</th>
                        <th className="px-4 py-3">Working Hours</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendance.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              log.status === 'Present' ? 'bg-green-100 text-green-700' :
                              log.status === 'Absent' ? 'bg-red-100 text-red-700' :
                              log.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatTime12Hour(log.check_in)}</td>
                          <td className="px-4 py-3 text-gray-600">{formatTime12Hour(log.check_out)}</td>
                          <td className="px-4 py-3 font-bold text-blue-600">
                             {calculateHours(log.check_in, log.check_out)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{log.notes || '-'}</td>
                        </tr>
                      ))}
                      {attendance.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No attendance records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-end">
              <button
                onClick={() => setShowLeaveForm(!showLeaveForm)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> {showLeaveForm ? 'Cancel' : 'New Leave Request'}
              </button>
            </div>

            {showLeaveForm && (
              <form onSubmit={handleApplyLeave} className="bg-white rounded-2xl border-2 border-brand-100 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    New Leave Request
                  </h3>
                  <p className="text-brand-100 text-sm mt-1">Submit a new leave application</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Leave Name *</label>
                      <input 
                        type="text" 
                        required
                        value={leaveForm.leave_name}
                        onChange={e => setLeaveForm({...leaveForm, leave_name: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="e.g. Sick Leave, Vacation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Work Handover To</label>
                      <input 
                        type="text" 
                        value={leaveForm.work_handover_to}
                        onChange={e => setLeaveForm({...leaveForm, work_handover_to: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="e.g. Colleague Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Start Date *</label>
                      <input 
                        type="date" 
                        required
                        value={leaveForm.start_date}
                        onChange={e => setLeaveForm({...leaveForm, start_date: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">From Type *</label>
                      <select 
                        value={leaveForm.from_leave_type}
                        onChange={e => setLeaveForm({...leaveForm, from_leave_type: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="First Half">First Half</option>
                        <option value="Second Half">Second Half</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">End Date *</label>
                      <input 
                        type="date" 
                        required
                        value={leaveForm.end_date}
                        onChange={e => setLeaveForm({...leaveForm, end_date: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">To Type *</label>
                      <select 
                        value={leaveForm.to_leave_type}
                        onChange={e => setLeaveForm({...leaveForm, to_leave_type: e.target.value})}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="First Half">First Half</option>
                        <option value="Second Half">Second Half</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Leave Reason *</label>
                    <textarea 
                      required
                      value={leaveForm.leave_reason}
                      onChange={e => setLeaveForm({...leaveForm, leave_reason: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none min-h-[100px]"
                      placeholder="Explain the reason for leave..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Notes</label>
                    <input 
                      type="text" 
                      value={leaveForm.notes}
                      onChange={e => setLeaveForm({...leaveForm, notes: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowLeaveForm(false)}
                    className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-white"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold"
                  >
                    Submit For Approval
                  </button>
                </div>
              </form>
            )}

            {loadingLeaves ? (
              <div className="text-center py-12 text-gray-400">Loading leave data...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden">
                    <p className="text-sm text-purple-700 font-bold uppercase tracking-wider mb-2">Casual Leave</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-purple-900">{leaveBalance?.casual_leave - leaveBalance?.used_casual_leave || 0}</span>
                      <span className="text-sm text-purple-600 mb-1">/ {leaveBalance?.casual_leave || 12} remaining</span>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
                    <p className="text-sm text-blue-700 font-bold uppercase tracking-wider mb-2">Sick Leave</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-blue-900">{leaveBalance?.sick_leave - leaveBalance?.used_sick_leave || 0}</span>
                      <span className="text-sm text-blue-600 mb-1">/ {leaveBalance?.sick_leave || 12} remaining</span>
                    </div>
                  </div>
                  <div className="p-6 bg-pink-50 rounded-xl border border-pink-100 relative overflow-hidden">
                    <p className="text-sm text-pink-700 font-bold uppercase tracking-wider mb-2">Paid Leave</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-pink-900">{leaveBalance?.paid_leave - leaveBalance?.used_paid_leave || 0}</span>
                      <span className="text-sm text-pink-600 mb-1">/ {leaveBalance?.paid_leave || 18} remaining</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {leaves.map(leave => (
                    <div key={leave.id} className="p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          leave.leave_type?.includes('Sick') ? 'bg-blue-50 text-blue-600' : 
                          'bg-purple-50 text-purple-600'
                        }`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{leave.leave_name || leave.leave_type}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()} 
                            <span className="mx-2">•</span>
                            {leave.from_leave_type} to {leave.to_leave_type}
                          </p>
                          {leave.leave_reason && (
                            <p className="text-xs text-gray-400 mt-1 max-w-md truncate">{leave.leave_reason}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {leave.status}
                        </span>
                        {leave.status === 'Pending' && currentUser?.role === 'ADMIN' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateLeaveStatus(leave.id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve"><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={() => handleUpdateLeaveStatus(leave.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject"><XCircle className="w-5 h-5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {leaves.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      No leave history found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {loadingSettings ? (
              <div className="text-center py-12 text-gray-400">Loading settings...</div>
            ) : (
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">Working Hours Configuration</h3>
                  <button onClick={handleSaveWorkingHours} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg"><Save className="w-4 h-4" /> Save</button>
                </div>
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  {workingHours.map((wh, index) => (
                    <div key={wh.day_of_week} className="grid grid-cols-4 gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
                      <div className="font-bold text-gray-900">{wh.day_of_week}</div>
                      <div>
                        <input type="checkbox" checked={wh.is_working_day} onChange={(e) => handleWorkingHourChange(index, 'is_working_day', e.target.checked)} className="rounded" />
                      </div>
                      <input type="time" value={wh.start_time} onChange={(e) => handleWorkingHourChange(index, 'start_time', e.target.value)} disabled={!wh.is_working_day} className="border rounded p-1 text-sm" />
                      <input type="time" value={wh.end_time} onChange={(e) => handleWorkingHourChange(index, 'end_time', e.target.value)} disabled={!wh.is_working_day} className="border rounded p-1 text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDetail;
