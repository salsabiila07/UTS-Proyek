import { randomUUID } from 'node:crypto';
import { findExtracurricular } from './extracurricularService.js';
import { listSchedules } from './scheduleService.js';

const registrations = [];

const romanGrades = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };

function gradeFromClass(value) {
  const normalized = value.trim().replace(/^kelas\s+/i, '').replace(/\s+/g, '').toUpperCase();
  const match = normalized.match(/^(VI|IV|V|III|II|I|[1-6])[A-Z]?$/);
  if (!match) return null;
  return romanGrades[match[1]] || Number(match[1]);
}

function raise(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function withActivity(registration) {
  const activity = findExtracurricular(registration.extracurricularId);
  const grade = gradeFromClass(registration.studentClass);
  const classSchedule = activity?.classSchedules
    ? activity.classSchedules.find((schedule) => schedule.grades.includes(grade)) || null
    : activity ? { day: activity.day, startTime: activity.startTime, endTime: activity.endTime } : null;
  return { ...registration, extracurricularName: activity?.name || 'Ekstrakurikuler dihapus', classSchedule };
}

export function listRegistrations(status) {
  return registrations
    .filter((registration) => !status || registration.status === status)
    .map(withActivity)
    .toSorted((a, b) => b.registrationDate.localeCompare(a.registrationDate));
}

export function listStudentRegistrations(studentId) {
  return registrations
    .filter((registration) => registration.studentId === studentId)
    .map(withActivity)
    .toSorted((a, b) => b.registrationDate.localeCompare(a.registrationDate));
}

export function findRegistration(id) {
  const registration = registrations.find((item) => item.id === id);
  return registration ? withActivity(registration) : null;
}

export function createRegistration(student, extracurricularId, identity) {
  const activity = findExtracurricular(extracurricularId);
  if (!activity || activity.status !== 'active') raise(404, 'Ekstrakurikuler aktif tidak ditemukan.');

  const grade = gradeFromClass(identity.studentClass);
  if (!grade) raise(422, 'Kelas tidak dikenali. Gunakan format seperti 5A, kelas 5, atau V A.');
  const classSchedule = activity.classSchedules
    ? activity.classSchedules.find((schedule) => schedule.grades.includes(grade))
    : { day: activity.day, startTime: activity.startTime, endTime: activity.endTime };
  if (!classSchedule) raise(422, `Ekstrakurikuler ${activity.name} hanya menerima kelas ${activity.classSchedules.flatMap((schedule) => schedule.grades).join(', ')}.`);

  const studentRegistrations = registrations.filter((item) => item.studentId === student.id && item.status !== 'rejected');
  const existingGrade = studentRegistrations.map((item) => gradeFromClass(item.studentClass)).find(Boolean);
  if (existingGrade && existingGrade !== grade) raise(409, `Kelas akun ini sudah tercatat sebagai kelas ${existingGrade}.`);

  const existing = registrations.find((item) => item.studentId === student.id && item.extracurricularId === extracurricularId && item.status !== 'rejected');
  if (existing) raise(409, 'Anda sudah mendaftar pada ekstrakurikuler ini.');

  const acceptedCount = registrations.filter((item) => item.extracurricularId === extracurricularId && item.status === 'accepted').length;
  if (acceptedCount >= activity.quota) raise(409, 'Kuota peserta ekstrakurikuler ini sudah terpenuhi.');

  const registration = {
    id: randomUUID(),
    studentId: student.id,
    studentName: identity.studentName,
    studentClass: identity.studentClass,
    extracurricularId,
    registrationDate: new Date().toISOString(),
    status: 'pending',
  };
  registrations.push(registration);
  return withActivity(registration);
}

export function listCoachRegistrations(coachId) {
  const extracurricularIds = new Set(listSchedules({ coachId }).map((schedule) => schedule.extracurricularId));
  return listRegistrations('accepted').filter((registration) => extracurricularIds.has(registration.extracurricularId));
}

export function setRegistrationStatus(id, status) {
  const registration = registrations.find((item) => item.id === id);
  if (!registration) return null;
  if (registration.status !== 'pending') raise(409, 'Hanya pendaftaran yang menunggu dapat diproses.');

  if (status === 'accepted') {
    const activity = findExtracurricular(registration.extracurricularId);
    const acceptedCount = registrations.filter((item) => item.extracurricularId === registration.extracurricularId && item.status === 'accepted').length;
    if (!activity || acceptedCount >= activity.quota) raise(409, 'Kuota peserta sudah terpenuhi; pendaftaran tidak dapat diterima.');
  }

  registration.status = status;
  return withActivity(registration);
}
