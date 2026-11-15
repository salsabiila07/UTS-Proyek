import { apiRequest } from './apiClient.js';

export const reportTypes = [
  { value: 'participants', label: 'Peserta ekstrakurikuler' },
  { value: 'registrations', label: 'Pendaftaran' },
  { value: 'attendance', label: 'Absensi' },
  { value: 'assessments', label: 'Penilaian dan perkembangan' },
  { value: 'activities', label: 'Kegiatan dan jadwal' },
  { value: 'recap', label: 'Rekap ekstrakurikuler' },
];

export const reportService = {
  get(filters) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value && value !== 'all') params.set(key, value);
    return apiRequest(`/api/reports?${params.toString()}`);
  },
};
