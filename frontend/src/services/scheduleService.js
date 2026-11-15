import { apiRequest } from './apiClient.js';

function serialize(values) {
  return {
    ...values,
    location: values.location.trim(),
    changeInformation: values.changeInformation.trim(),
  };
}

export const scheduleService = {
  getAll() {
    return apiRequest('/api/schedules');
  },

  getMine() {
    return apiRequest('/api/schedules/mine');
  },

  getTimetable() {
    return apiRequest('/api/schedules/timetable');
  },

  getMyActivities() {
    return apiRequest('/api/schedules/mine/activities');
  },

  create(values) {
    return apiRequest('/api/schedules', { method: 'POST', body: JSON.stringify(serialize(values)) });
  },

  update(id, values) {
    return apiRequest(`/api/schedules/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(serialize(values)) });
  },

  remove(id) {
    return apiRequest(`/api/schedules/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export function getWeekday(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function validateSchedule(values) {
  const errors = {};
  const parsedDate = typeof values.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(values.date) ? new Date(`${values.date}T12:00:00Z`) : null;
  const dateValid = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === values.date;
  if (!values.extracurricularId) errors.extracurricularId = 'Ekstrakurikuler wajib dipilih.';
  if (!dateValid) errors.date = 'Tanggal jadwal tidak valid.';
  else if (values.day !== getWeekday(values.date)) errors.day = 'Hari tidak sesuai dengan tanggal.';
  if (!values.startTime) errors.startTime = 'Waktu mulai wajib diisi.';
  if (!values.endTime) errors.endTime = 'Waktu selesai wajib diisi.';
  else if (values.startTime && values.endTime <= values.startTime) errors.endTime = 'Waktu selesai harus setelah waktu mulai.';
  if (!values.location.trim()) errors.location = 'Lokasi wajib diisi.';
  if (!values.coachId) errors.coachId = 'Pembina wajib dipilih.';
  if (!['scheduled', 'changed', 'cancelled'].includes(values.status)) errors.status = 'Status jadwal tidak valid.';
  if (values.changeInformation.length > 300) errors.changeInformation = 'Informasi maksimal 300 karakter.';
  if (['changed', 'cancelled'].includes(values.status) && !values.changeInformation.trim()) errors.changeInformation = 'Informasi wajib diisi untuk jadwal yang diubah atau dibatalkan.';
  return errors;
}

export const scheduleStatuses = {
  scheduled: { label: 'Terjadwal', tone: 'info' },
  changed: { label: 'Diubah', tone: 'warning' },
  cancelled: { label: 'Dibatalkan', tone: 'danger' },
};
