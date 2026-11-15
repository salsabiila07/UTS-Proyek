import { randomUUID } from 'node:crypto';
import { listRegistrations } from './registrationService.js';
import { findSchedule, listSchedules } from './scheduleService.js';

const attendanceRecords = [];
const attendanceStatuses = ['present', 'permission', 'sick', 'absent'];

function raise(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function acceptedStudents(extracurricularId) {
  return listRegistrations('accepted').filter((registration) => registration.extracurricularId === extracurricularId);
}

function attendanceDetails(record) {
  const schedule = findSchedule(record.scheduleId);
  return {
    ...record,
    extracurricularName: schedule?.extracurricularName || 'Ekstrakurikuler dihapus',
    coachName: schedule?.coachName || 'Pembina',
    scheduleDate: schedule?.date || record.date,
    scheduleDay: schedule?.day || '',
    startTime: schedule?.startTime || '',
  };
}

export function listAttendance({ status, date, extracurricularId } = {}) {
  return attendanceRecords
    .filter((record) => (!status || record.status === status) && (!date || record.date === date) && (!extracurricularId || record.extracurricularId === extracurricularId))
    .map(attendanceDetails)
    .toSorted((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
}

export function listCoachAttendance(coachId) {
  const assignedScheduleIds = new Set(listSchedules({ coachId }).map((schedule) => schedule.id));
  return listAttendance().filter((record) => assignedScheduleIds.has(record.scheduleId));
}

export function listStudentAttendance(studentId) {
  return listAttendance().filter((record) => record.studentId === studentId);
}

export function getScheduleAttendance(scheduleId, coachId) {
  const schedule = findSchedule(scheduleId);
  if (!schedule) raise(404, 'Jadwal tidak ditemukan.');
  if (schedule.coachId !== coachId) raise(403, 'Jadwal ini bukan tugas Anda.');
  const students = acceptedStudents(schedule.extracurricularId).map((registration) => {
    const record = attendanceRecords.find((item) => item.scheduleId === scheduleId && item.studentId === registration.studentId);
    return { studentId: registration.studentId, studentName: registration.studentName, status: record?.status || '', notes: record?.notes || '' };
  });
  return { schedule, students };
}

export function saveScheduleAttendance(scheduleId, coachId, entries) {
  const schedule = findSchedule(scheduleId);
  if (!schedule) raise(404, 'Jadwal tidak ditemukan.');
  if (schedule.coachId !== coachId) raise(403, 'Jadwal ini bukan tugas Anda.');
  if (schedule.status === 'cancelled') raise(409, 'Absensi tidak dapat dicatat untuk jadwal yang dibatalkan.');
  if (!Array.isArray(entries) || entries.length === 0) raise(422, 'Belum ada peserta yang dapat dicatat.');

  const students = acceptedStudents(schedule.extracurricularId);
  const studentById = new Map(students.map((student) => [student.studentId, student]));
  const submittedIds = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry.studentId !== 'string' || !studentById.has(entry.studentId)) raise(422, 'Daftar peserta absensi tidak valid.');
    if (submittedIds.has(entry.studentId)) raise(422, 'Peserta tercantum lebih dari satu kali.');
    submittedIds.add(entry.studentId);
    if (!attendanceStatuses.includes(entry.status)) raise(422, 'Status kehadiran belum lengkap atau tidak valid.');
    if (typeof (entry.notes ?? '') !== 'string' || (entry.notes ?? '').length > 300) raise(422, 'Catatan maksimal 300 karakter.');
  }
  if (submittedIds.size !== studentById.size) raise(422, 'Status kehadiran harus diisi untuk semua peserta yang diterima.');

  const saved = [];
  for (const entry of entries) {
    const student = studentById.get(entry.studentId);
    const existing = attendanceRecords.find((item) => item.scheduleId === scheduleId && item.studentId === entry.studentId);
    const record = {
      id: existing?.id || randomUUID(),
      studentId: entry.studentId,
      studentName: student.studentName,
      extracurricularId: schedule.extracurricularId,
      scheduleId,
      date: schedule.date,
      status: entry.status,
      notes: (entry.notes || '').trim(),
    };
    if (existing) Object.assign(existing, record);
    else attendanceRecords.push(record);
    saved.push(attendanceDetails(record));
  }
  return saved;
}
