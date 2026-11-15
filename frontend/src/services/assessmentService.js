import { apiRequest } from './apiClient.js';

function queryString(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  return params.size ? `?${params.toString()}` : '';
}

export const assessmentService = {
  getRoster(extracurricularId) {
    return apiRequest(`/api/assessments/roster${queryString({ extracurricularId })}`);
  },
  getMine(filters = {}) {
    return apiRequest(`/api/assessments/mine${queryString(filters)}`);
  },
  save(payload) {
    return apiRequest('/api/assessments', { method: 'PUT', body: JSON.stringify(payload) });
  },
  getAdmin(filters = {}) {
    return apiRequest(`/api/assessments${queryString(filters)}`);
  },
};
