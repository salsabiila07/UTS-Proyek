import { listCoachRegistrations, listStudentRegistrations } from './registrationService.js';
import { listSchedules, listSchedulesForUser } from './scheduleService.js';
import { getReport } from './reportService.js';

function localDate(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function upcoming(schedules) {
  return schedules
    .filter((schedule) => schedule.date >= localDate() && schedule.status !== 'cancelled')
    .slice(0, 5);
}

function stat(key, label, value, detail) { return { key, label, value, detail }; }

export function getRoleDashboard(user) {
  if (user.role === 'student') {
    const registrations = listStudentRegistrations(user.id);
    const schedules = upcoming(listSchedulesForUser(user));
    return {
      role: user.role,
      stats: [
        stat('registrations', 'Pendaftaran', registrations.length, 'Semua pengajuan kegiatan'),
        stat('accepted', 'Diterima', registrations.filter((item) => item.status === 'accepted').length, 'Pendaftaran disetujui'),
        stat('pending', 'Menunggu', registrations.filter((item) => item.status === 'pending').length, 'Menunggu persetujuan admin'),
        stat('schedules', 'Jadwal mendatang', schedules.length, 'Kegiatan yang akan diikuti'),
      ],
      registrations,
      schedules,
    };
  }

  if (user.role === 'coach') {
    const allSchedules = listSchedules({ coachId: user.id });
    const participants = listCoachRegistrations(user.id);
    const schedules = upcoming(allSchedules);
    const activities = new Set(allSchedules.map((schedule) => schedule.extracurricularId));
    return {
      role: user.role,
      stats: [
        stat('participants', 'Peserta terdaftar', participants.length, 'Dari kegiatan yang ditugaskan'),
        stat('activities', 'Kegiatan tugas', activities.size, 'Ekstrakurikuler pembina'),
        stat('schedules', 'Jadwal mendatang', schedules.length, 'Jadwal yang perlu disiapkan'),
      ],
      participants,
      schedules,
    };
  }

  if (user.role === 'principal') {
    const reports = [
      { key: 'participants', type: 'participants', label: 'Peserta aktif', detail: 'Siswa dengan pendaftaran diterima' },
      { key: 'registrations', type: 'registrations', label: 'Pendaftaran', detail: 'Seluruh status pendaftaran' },
      { key: 'attendance', type: 'attendance', label: 'Catatan absensi', detail: 'Catatan yang sudah disimpan' },
      { key: 'assessments', type: 'assessments', label: 'Penilaian', detail: 'Penilaian per periode' },
    ].map((item) => ({ ...item, count: getReport({ type: item.type }).rows.length }));
    return {
      role: user.role,
      stats: reports.map((item) => stat(item.key, item.label, item.count, item.detail)),
      reports: reports.map(({ type, label, count }) => ({ type, label, count })),
    };
  }

  const error = new Error('Dashboard tidak tersedia untuk peran ini.');
  error.status = 403;
  throw error;
}
