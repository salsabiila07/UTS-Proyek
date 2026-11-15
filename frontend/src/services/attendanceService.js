import { apiRequest } from './apiClient.js';

export const attendanceService = {
  getMine() {
    return apiRequest('/api/attendance/mine');
  },

  getForSchedule(scheduleId) {
    return apiRequest(`/api/attendance/schedules/${encodeURIComponent(scheduleId)}`);
  },

  saveForSchedule(scheduleId, entries) {
    return apiRequest(`/api/attendance/schedules/${encodeURIComponent(scheduleId)}`, { method: 'PUT', body: JSON.stringify({ entries }) });
  },

  getAdmin(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value && value !== 'all') params.set(key, value);
    const query = params.size ? `?${params.toString()}` : '';
    return apiRequest(`/api/attendance${query}`);
  },
};
