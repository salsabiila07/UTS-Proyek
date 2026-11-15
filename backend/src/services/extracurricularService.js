import { randomUUID } from 'node:crypto';

let activities = [
  { id: 'ekskul-tari', name: 'Tari', description: 'Mengekspresikan kreativitas melalui gerak dan seni tari.', coach: 'Pembina Tari', coachId: 'demo-coach', day: 'Rabu', startTime: '13:30', endTime: '15:00', location: 'Ruang kesenian', quota: 25, status: 'active', image: '/images/tari.jpg' },
  { id: 'ekskul-pramuka', name: 'Pramuka', description: 'Melatih kemandirian, kedisiplinan, dan kerja sama melalui kegiatan kepramukaan.', coach: 'Pembina Pramuka', coachId: 'demo-coach', day: 'Rabu', startTime: '14:00', endTime: '15:30', location: 'Lapangan sekolah', quota: 80, status: 'active', image: '/images/pramuka.jpg' },
  { id: 'ekskul-it', name: 'IT', description: 'Mengenal komputer dan mengembangkan keterampilan teknologi.', coach: 'Pembina IT', day: 'Selasa', startTime: '14:00', endTime: '15:30', location: 'Ruang komputer', quota: 30, status: 'active', image: '/images/IT.jpg' },
  { id: 'ekskul-bahasa-inggris', name: 'Bahasa Inggris', description: 'Berlatih kosakata dan percakapan bahasa Inggris.', coach: 'Pembina Bahasa Inggris', day: 'Kamis', startTime: '14:00', endTime: '15:00', location: 'Ruang kelas', quota: 30, status: 'active', image: '/images/bhs ingg.jpg' },
  { id: 'ekskul-btq', name: 'BTQ', description: 'Belajar membaca dan memahami Al-Qur’an.', coach: 'Pembina BTQ', day: 'Jumat', startTime: '14:00', endTime: '15:00', location: 'Ruang belajar', quota: 30, status: 'active', image: '/images/BTQ.jpg' },
];

Object.assign(activities.find(({ id }) => id === 'ekskul-tari'), { day: 'Rabu', startTime: '11:00', endTime: '12:00', classSchedules: [{ grades: [1, 2], day: 'Rabu', startTime: '11:00', endTime: '12:00' }, { grades: [3, 4, 5], day: 'Rabu', startTime: '12:00', endTime: '13:00' }] });
Object.assign(activities.find(({ id }) => id === 'ekskul-pramuka'), { day: 'Sabtu', startTime: '10:00', endTime: '12:00', mandatory: true, classSchedules: [{ grades: [1, 2, 3, 4, 5, 6], day: 'Sabtu', startTime: '10:00', endTime: '12:00' }] });
Object.assign(activities.find(({ id }) => id === 'ekskul-it'), { day: 'Selasa', startTime: '12:00', endTime: '13:00', classSchedules: [{ grades: [3, 4, 5, 6], day: 'Selasa', startTime: '12:00', endTime: '13:00' }] });
Object.assign(activities.find(({ id }) => id === 'ekskul-bahasa-inggris'), { day: 'Selasa', startTime: '11:00', endTime: '12:00', classSchedules: [{ grades: [1, 2], day: 'Selasa', startTime: '11:00', endTime: '12:00' }] });
Object.assign(activities.find(({ id }) => id === 'ekskul-btq'), { day: 'Senin', startTime: '11:00', endTime: '12:00', classSchedules: [{ grades: [1, 2], day: 'Senin', startTime: '11:00', endTime: '12:00' }, { grades: [3, 4, 5, 6], day: 'Senin', startTime: '12:00', endTime: '13:00' }] });

export function listExtracurriculars() {
  return activities.toSorted((a, b) => a.name.localeCompare(b.name, 'id'));
}

export function listExtracurricularsForCoach(coachId) {
  return activities.filter((activity) => activity.coachId === coachId && activity.status === 'active').toSorted((a, b) => a.name.localeCompare(b.name, 'id'));
}

export function listManagedExtracurricularsForCoach(coachId) {
  return activities.filter((activity) => activity.coachId === coachId).toSorted((a, b) => a.name.localeCompare(b.name, 'id'));
}

export function findExtracurricular(id) {
  return activities.find((activity) => activity.id === id) || null;
}

export function createExtracurricular(values) {
  const activity = { ...values, quota: Number(values.quota), id: randomUUID() };
  activities = [...activities, activity];
  return activity;
}

export function updateExtracurricular(id, values) {
  const index = activities.findIndex((activity) => activity.id === id);
  if (index < 0) return null;
  activities[index] = { ...activities[index], ...values, quota: Number(values.quota), id };
  return activities[index];
}

export function deleteExtracurricular(id) {
  const currentLength = activities.length;
  activities = activities.filter((activity) => activity.id !== id);
  return activities.length !== currentLength;
}

export function validateExtracurricular(values) {
  const errors = {};
  const name = typeof values.name === 'string' ? values.name.trim() : '';
  const description = typeof values.description === 'string' ? values.description.trim() : '';
  const coach = typeof values.coach === 'string' ? values.coach.trim() : '';
  const location = typeof values.location === 'string' ? values.location.trim() : '';
  const image = typeof values.image === 'string' ? values.image.trim() : '';
  const quota = Number(values.quota);
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  if (name.length < 2 || name.length > 60) errors.name = 'Nama harus terdiri dari 2–60 karakter.';
  if (description.length > 300) errors.description = 'Deskripsi maksimal 300 karakter.';
  if (!coach || coach.length > 80) errors.coach = 'Nama pembina wajib diisi dan maksimal 80 karakter.';
  if (!days.includes(values.day)) errors.day = 'Hari kegiatan tidak valid.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.startTime || '')) errors.startTime = 'Waktu mulai tidak valid.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.endTime || '') || values.endTime <= values.startTime) errors.endTime = 'Waktu selesai harus setelah waktu mulai.';
  if (!location || location.length > 100) errors.location = 'Lokasi wajib diisi dan maksimal 100 karakter.';
  if (!Number.isInteger(quota) || quota < 1 || quota > 999) errors.quota = 'Kuota harus berupa bilangan bulat 1–999.';
  if (!['active', 'inactive'].includes(values.status)) errors.status = 'Status kegiatan tidak valid.';
  if (image) {
    try {
      const url = new URL(image);
      if (!['http:', 'https:'].includes(url.protocol)) errors.image = 'URL gambar harus menggunakan HTTP atau HTTPS.';
    } catch {
      errors.image = 'Masukkan URL gambar yang valid.';
    }
  }
  return errors;
}
