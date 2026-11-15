import { randomUUID } from 'node:crypto';
import { findExtracurricular, listExtracurriculars, listExtracurricularsForCoach } from './extracurricularService.js';
import { listStudentRegistrations } from './registrationService.js';

const weekdays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const coachNames = { 'demo-coach': 'Pembina Demo' };

function nextOccurrence(day) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const offset = (weekdays.indexOf(day) - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + offset);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { date: iso, day: weekdayFor(iso) };
}

function weekdayFor(value) {
  return weekdays[new Date(`${value}T12:00:00Z`).getUTCDay()];
}

function localDateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function listWeeklySchedules() {
  return listExtracurriculars().flatMap((activity) => {
    const slots = activity.classSchedules || [{ grades: [], day: activity.day, startTime: activity.startTime, endTime: activity.endTime }];
    return slots.map((slot, index) => {
      const occurrence = nextOccurrence(slot.day);
      return {
        id: `weekly-${activity.id}-${index + 1}`,
        extracurricularId: activity.id,
        extracurricularName: activity.name,
        date: occurrence.date,
        day: occurrence.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: activity.location,
        coachId: activity.coachId,
        coachName: activity.coach,
        status: 'scheduled',
        changeInformation: '',
        studentClass: slot.grades.join(', '),
        recurring: true,
      };
    });
  }).toSorted((a, b) => `${weekdays.indexOf(a.day)} ${a.startTime}`.localeCompare(`${weekdays.indexOf(b.day)} ${b.startTime}`));
}

const first = nextOccurrence('Sabtu');
const fourth = nextOccurrence('Rabu');
let schedules = [
  { id: 'schedule-pramuka', extracurricularId: 'ekskul-pramuka', date: first.date, day: first.day, startTime: '10:00', endTime: '12:00', location: 'Lapangan sekolah', coachId: 'demo-coach', status: 'scheduled', changeInformation: '' },
  { id: 'schedule-tari', extracurricularId: 'ekskul-tari', date: fourth.date, day: fourth.day, startTime: '11:00', endTime: '12:00', location: 'Ruang kesenian', coachId: 'demo-coach', status: 'scheduled', changeInformation: '' },
];

function raise(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function withDetails(schedule) {
  const activity = findExtracurricular(schedule.extracurricularId);
  return { ...schedule, extracurricularName: activity?.name || 'Ekstrakurikuler dihapus', coachName: coachNames[schedule.coachId] || 'Pembina' };
}

export function listSchedules({ coachId, extracurricularIds } = {}) {
  return schedules
    .filter((schedule) => (!coachId || schedule.coachId === coachId) && (!extracurricularIds || extracurricularIds.has(schedule.extracurricularId)))
    .map(withDetails)
    .toSorted((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

export function listSchedulesForUser(user) {
  if (user.role === 'coach') return listSchedules({ coachId: user.id });
  if (user.role === 'student') {
    const registrations = listStudentRegistrations(user.id).filter((registration) => registration.status === 'accepted');
    const registrationByActivity = new Map(registrations.map((registration) => [registration.extracurricularId, registration]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = localDateValue(today);
    const upcoming = listSchedules({ extracurricularIds: new Set(registrationByActivity.keys()) })
      .filter((schedule) => schedule.date >= todayIso)
      .map((schedule) => {
        const registration = registrationByActivity.get(schedule.extracurricularId);
        const classSchedule = registration?.classSchedule;
        return classSchedule && schedule.status === 'scheduled'
          ? { ...schedule, day: classSchedule.day, startTime: classSchedule.startTime, endTime: classSchedule.endTime, studentClass: registration.studentClass }
          : { ...schedule, studentClass: registration?.studentClass };
      });
    const activitiesWithUpcomingSchedules = new Set(upcoming.map((schedule) => schedule.extracurricularId));

    for (const registration of registrations) {
      if (activitiesWithUpcomingSchedules.has(registration.extracurricularId)) continue;
      const activity = findExtracurricular(registration.extracurricularId);
      const classSchedule = registration.classSchedule;
      if (!activity || !classSchedule) continue;
      const targetWeekday = weekdays.indexOf(classSchedule.day);
      const offset = (targetWeekday - today.getDay() + 7) % 7;
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + offset);
      upcoming.push({
        id: `weekly-${registration.id}`,
        extracurricularId: activity.id,
        extracurricularName: activity.name,
        date: localDateValue(nextDate),
        day: classSchedule.day,
        startTime: classSchedule.startTime,
        endTime: classSchedule.endTime,
        location: activity.location,
        coachName: activity.coach,
        status: 'scheduled',
        changeInformation: '',
        studentClass: registration.studentClass,
        recurring: true,
      });
    }

    return upcoming.toSorted((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }
  return [];
}

export function listCoachSchedules(user) {
  return listSchedules({ coachId: user.id });
}

export function canCoachManageSchedule(user, schedule) {
  return user.role === 'coach'
    && schedule?.coachId === user.id
    && listExtracurricularsForCoach(user.id).some((activity) => activity.id === schedule.extracurricularId);
}

export function canCoachScheduleActivity(user, extracurricularId) {
  return listExtracurricularsForCoach(user.id).some((activity) => activity.id === extracurricularId);
}

export function findSchedule(id) {
  const schedule = schedules.find((item) => item.id === id);
  return schedule ? withDetails(schedule) : null;
}

export function createSchedule(values) {
  const schedule = { ...values, id: randomUUID() };
  schedules.push(schedule);
  return withDetails(schedule);
}

export function updateSchedule(id, values) {
  const index = schedules.findIndex((item) => item.id === id);
  if (index < 0) return null;
  schedules[index] = { ...schedules[index], ...values, id };
  return withDetails(schedules[index]);
}

export function deleteSchedule(id) {
  const length = schedules.length;
  schedules = schedules.filter((item) => item.id !== id);
  return schedules.length !== length;
}

export function validateSchedule(values, { allowInactiveActivity = false } = {}) {
  const errors = {};
  const activity = findExtracurricular(values.extracurricularId);
  const parsedDate = typeof values.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(values.date) ? new Date(`${values.date}T12:00:00Z`) : null;
  const dateValid = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === values.date;
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  const location = typeof values.location === 'string' ? values.location.trim() : '';
  const changeInformation = typeof values.changeInformation === 'string' ? values.changeInformation.trim() : '';

  if (!activity || (!allowInactiveActivity && activity.status !== 'active')) errors.extracurricularId = 'Pilih ekstrakurikuler yang aktif.';
  if (!dateValid) errors.date = 'Tanggal jadwal tidak valid.';
  else if (values.day !== weekdayFor(values.date)) errors.day = 'Hari tidak sesuai dengan tanggal.';
  if (!timePattern.test(values.startTime || '')) errors.startTime = 'Waktu mulai tidak valid.';
  if (!timePattern.test(values.endTime || '') || values.endTime <= values.startTime) errors.endTime = 'Waktu selesai harus setelah waktu mulai.';
  if (!location || location.length > 100) errors.location = 'Lokasi wajib diisi dan maksimal 100 karakter.';
  if (values.coachId !== 'demo-coach') errors.coachId = 'Pembina tidak valid.';
  if (!['scheduled', 'changed', 'cancelled'].includes(values.status)) errors.status = 'Status jadwal tidak valid.';
  if (changeInformation.length > 300) errors.changeInformation = 'Informasi perubahan maksimal 300 karakter.';
  if (['changed', 'cancelled'].includes(values.status) && !changeInformation) errors.changeInformation = 'Informasi wajib diisi untuk jadwal yang diubah atau dibatalkan.';
  return errors;
}

export function normalizeSchedule(values) {
  return { ...values, location: values.location.trim(), changeInformation: values.changeInformation.trim() };
}

