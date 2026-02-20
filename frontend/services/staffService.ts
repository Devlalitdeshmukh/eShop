import api from './api';

export const staffService = {
  // Attendance
  markAttendance: (data: any) => api.post('/staff/attendance', data),
  getAttendance: (userId: string, startDate?: string, endDate?: string) => 
    api.get(`/staff/attendance?user_id=${userId}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`),
  getAttendanceStats: (userId: string, month: number, year: number) => 
    api.get(`/staff/attendance/stats?user_id=${userId}&month=${month}&year=${year}`),

  // Leaves
  applyLeave: (data: any) => api.post('/staff/leaves', data),
  getLeaves: (userId?: string, status?: string) => 
    api.get(`/staff/leaves?${userId ? `user_id=${userId}` : ''}${status ? `&status=${status}` : ''}`),
  updateLeaveStatus: (id: string, status: string, approvedBy: string) => 
    api.put(`/staff/leaves/${id}`, { status, approved_by: approvedBy }),
  getLeaveBalance: (userId: string, year: number) => 
    api.get(`/staff/leaves/balance?user_id=${userId}&year=${year}`),

  // Holidays
  getHolidays: (year: number) => api.get(`/staff/holidays?year=${year}`),
  createHoliday: (data: any) => api.post('/staff/holidays', data),
  deleteHoliday: (id: string) => api.delete(`/staff/holidays/${id}`),

  // Working Hours
  getWorkingHours: (userId: string) => api.get(`/staff/working-hours?user_id=${userId}`),
  setWorkingHours: (data: any) => api.post('/staff/working-hours', data),
};
