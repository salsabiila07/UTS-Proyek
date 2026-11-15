import { apiRequest } from './apiClient.js';

function serialize(values) {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description.trim(),
    coach: values.coach.trim(),
    location: values.location.trim(),
    quota: Number(values.quota),
    image: values.image.trim(),
  };
}

export const extracurricularService = {
  getAll() {
    return apiRequest('/api/extracurriculars');
  },

  async getById(id) {
    try {
      return await apiRequest(`/api/extracurriculars/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  create(values) {
    return apiRequest('/api/extracurriculars', { method: 'POST', body: JSON.stringify(serialize(values)) });
  },

  update(id, values) {
    return apiRequest(`/api/extracurriculars/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(serialize(values)) });
  },

  remove(id) {
    return apiRequest(`/api/extracurriculars/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export function validateExtracurricular(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Nama ekstrakurikuler wajib diisi.';
  else if (values.name.trim().length < 2 || values.name.trim().length > 60) errors.name = 'Nama harus terdiri dari 2–60 karakter.';
  if (values.description.length > 300) errors.description = 'Deskripsi maksimal 300 karakter.';
  if (!values.coach.trim()) errors.coach = 'Nama pembina wajib diisi.';
  if (!values.day) errors.day = 'Hari kegiatan wajib dipilih.';
  if (!values.startTime) errors.startTime = 'Waktu mulai wajib diisi.';
  if (!values.endTime) errors.endTime = 'Waktu selesai wajib diisi.';
  else if (values.startTime && values.endTime <= values.startTime) errors.endTime = 'Waktu selesai harus setelah waktu mulai.';
  if (!values.location.trim()) errors.location = 'Lokasi kegiatan wajib diisi.';
  const quota = Number(values.quota);
  if (!Number.isInteger(quota) || quota < 1 || quota > 999) errors.quota = 'Kuota harus berupa bilangan bulat 1–999.';
  if (!['active', 'inactive'].includes(values.status)) errors.status = 'Status kegiatan tidak valid.';
  if (values.image.trim()) {
    try {
      const url = new URL(values.image.trim());
      if (!['http:', 'https:'].includes(url.protocol)) errors.image = 'URL gambar harus menggunakan HTTP atau HTTPS.';
    } catch {
      errors.image = 'Masukkan URL gambar yang valid.';
    }
  }
  return errors;
}
