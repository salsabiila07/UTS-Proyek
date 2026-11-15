import { randomUUID } from 'node:crypto';
import { listRegistrations } from './registrationService.js';
import { listSchedules } from './scheduleService.js';
import { findExtracurricular } from './extracurricularService.js';

const assessments = [];
const scoreFields = ['skillScore', 'disciplineScore', 'activityScore'];

function raise(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function assignedActivityIds(coachId) {
  return new Set(listSchedules({ coachId }).map(({ extracurricularId }) => extracurricularId));
}

function assessmentDetails(record) {
  const activity = findExtracurricular(record.extracurricularId);
  return { ...record, extracurricularName: activity?.name || 'Ekstrakurikuler dihapus' };
}

export function listAssessments({ extracurricularId, period } = {}) {
  return assessments
    .filter((record) => (!extracurricularId || record.extracurricularId === extracurricularId) && (!period || record.period === period))
    .map(assessmentDetails)
    .toSorted((a, b) => b.period.localeCompare(a.period) || a.studentName.localeCompare(b.studentName, 'id'));
}

export function listCoachAssessments(coachId, filters = {}) {
  const assignedIds = assignedActivityIds(coachId);
  return listAssessments(filters).filter((record) => assignedIds.has(record.extracurricularId));
}

export function getAssessmentRoster(extracurricularId, coachId) {
  if (!assignedActivityIds(coachId).has(extracurricularId)) raise(403, 'Kegiatan ini bukan tugas Anda.');
  const activity = findExtracurricular(extracurricularId);
  if (!activity) raise(404, 'Ekstrakurikuler tidak ditemukan.');
  const students = listRegistrations('accepted')
    .filter((registration) => registration.extracurricularId === extracurricularId)
    .map(({ studentId, studentName }) => ({ studentId, studentName }));
  return { activity, students };
}

export function saveAssessments(coachId, extracurricularId, period, entries) {
  const { students } = getAssessmentRoster(extracurricularId, coachId);
  if (typeof period !== 'string' || !/^\d{4}-(1|2)$/.test(period)) raise(422, 'Periode penilaian tidak valid.');
  if (!Array.isArray(entries) || entries.length !== students.length || !students.length) raise(422, 'Penilaian harus diisi untuk semua peserta yang diterima.');
  const studentById = new Map(students.map((student) => [student.studentId, student]));
  const submittedIds = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry.studentId !== 'string' || !studentById.has(entry.studentId) || submittedIds.has(entry.studentId)) raise(422, 'Daftar peserta penilaian tidak valid.');
    submittedIds.add(entry.studentId);
    if (scoreFields.some((field) => !Number.isInteger(Number(entry[field])) || Number(entry[field]) < 0 || Number(entry[field]) > 100)) raise(422, 'Nilai skill, disiplin, dan keaktifan harus berupa bilangan bulat 0–100.');
    if (typeof (entry.developmentNotes ?? '') !== 'string' || (entry.developmentNotes ?? '').trim().length > 500) raise(422, 'Catatan perkembangan maksimal 500 karakter.');
  }
  const saved = entries.map((entry) => {
    const student = studentById.get(entry.studentId);
    const existing = assessments.find((item) => item.studentId === entry.studentId && item.extracurricularId === extracurricularId && item.period === period);
    const record = {
      id: existing?.id || randomUUID(), studentId: student.studentId, studentName: student.studentName,
      extracurricularId, period, skillScore: Number(entry.skillScore), disciplineScore: Number(entry.disciplineScore),
      activityScore: Number(entry.activityScore), developmentNotes: (entry.developmentNotes || '').trim(),
    };
    if (existing) Object.assign(existing, record);
    else assessments.push(record);
    return assessmentDetails(record);
  });
  return saved;
}
