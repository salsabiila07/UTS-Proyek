import { apiRequest } from './apiClient.js';
import { registrationService } from './registrationService.js';

function addDaysToToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function recentMonths() {
  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    return {
      label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(month),
      value: [18, 24, 19, 31, 27, 32][index],
    };
  });
}

const overview = {
  stats: [
    { key: 'activities', label: 'Ekstrakurikuler', value: 5, detail: 'Pilihan kegiatan' },
    { key: 'coaches', label: 'Pembina', value: 5, detail: 'Pembina aktif' },
    { key: 'applicants', label: 'Pendaftar', value: 1, detail: 'Total pendaftar' },
    { key: 'active', label: 'Kegiatan aktif', value: 5, detail: 'Berjalan saat ini' },
  ],
  registrations: recentMonths(),
  participants: [
    { name: 'Pramuka', value: 68 },
    { name: 'Tari', value: 18 },
    { name: 'IT', value: 14 },
    { name: 'Bahasa Inggris', value: 24 },
    { name: 'BTQ', value: 30 },
  ],
  schedules: [
    { id: 'schedule-1', name: 'Pramuka', date: addDaysToToday(1), time: '14.00–15.30', location: 'Lapangan sekolah', coach: 'Pembina Pramuka' },
    { id: 'schedule-2', name: 'Tari', date: addDaysToToday(5), time: '13.30–15.00', location: 'Ruang kesenian', coach: 'Pembina Tari' },
  ],
  activity: [
    { id: 'activity-1', title: 'Pendaftaran siswa baru diterima', detail: 'Pendaftaran Ekstrakurikuler · Pramuka', time: 'Hari ini, 09.20', tone: 'success' },
    { id: 'activity-2', title: 'Jadwal kegiatan diperbarui', detail: 'Ekstrakurikuler · Tari', time: 'Hari ini, 08.45', tone: 'info' },
    { id: 'activity-3', title: 'Absensi kegiatan telah dicatat', detail: 'Ekstrakurikuler · Tari', time: 'Kemarin, 15.10', tone: 'neutral' },
    { id: 'activity-4', title: 'Penilaian perkembangan ditambahkan', detail: 'Ekstrakurikuler · BTQ', time: 'Kemarin, 13.35', tone: 'neutral' },
  ],
};

export const dashboardService = {
  async getOverview() {
    const registrations = await registrationService.getAll();
    return {
      ...overview,
      stats: overview.stats.map((item) => item.key === 'applicants'
        ? { ...item, value: registrations.length, detail: 'Total pengajuan pendaftaran' }
        : item),
    };
  },

  getRoleOverview() {
    return apiRequest('/api/dashboard/mine');
  },
};

