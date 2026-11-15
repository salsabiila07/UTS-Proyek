import { apiRequest } from './apiClient.js';

export const registrationService = {
  getMine() {
    return apiRequest('/api/registrations/mine');
  },

  getAll(status = 'all') {
    const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`;
    return apiRequest(`/api/registrations${query}`);
  },

  getCoachParticipants() {
    return apiRequest('/api/registrations/coach');
  },

  create(extracurricularId, { studentName, studentClass }) {
    return apiRequest('/api/registrations', { method: 'POST', body: JSON.stringify({ extracurricularId, studentName, studentClass }) });
  },

  updateStatus(id, status) {
    return apiRequest(`/api/registrations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
};
