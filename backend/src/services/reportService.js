import { listExtracurriculars } from './extracurricularService.js';
import { listRegistrations } from './registrationService.js';
import { listSchedules } from './scheduleService.js';
import { listAttendance } from './attendanceService.js';
import { listAssessments } from './assessmentService.js';

const attendanceLabels = { present: 'Hadir', permission: 'Izin', sick: 'Sakit', absent: 'Alfa' };
const registrationLabels = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak' };

function withinDate(value, from, to) {
  const date = value?.slice(0, 10) || '';
  return (!from || date >= from) && (!to || date <= to);
}

function filteredActivityRecords(records, { extracurricularId, from, to }, dateField) {
  return records.filter((record) => (!extracurricularId || record.extracurricularId === extracurricularId) && withinDate(record[dateField], from, to));
}

function table(title, columns, rows) { return { title, columns, rows }; }

export function getReport({ type, extracurricularId = '', from = '', to = '', status = '', period = '' }) {
  const allowedTypes = ['participants', 'registrations', 'attendance', 'assessments', 'activities', 'recap'];
  if (!allowedTypes.includes(type)) throw Object.assign(new Error('Jenis laporan tidak valid.'), { status: 422 });
  if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) || (from && to && from > to)) {
    throw Object.assign(new Error('Rentang tanggal tidak valid.'), { status: 422 });
  }
  if (period && !/^\d{4}-(1|2)$/.test(period)) throw Object.assign(new Error('Periode penilaian tidak valid.'), { status: 422 });
  const registrationStatusValues = ['pending', 'accepted', 'rejected'];
  const attendanceStatusValues = Object.keys(attendanceLabels);
  if (status && ((type === 'registrations' && !registrationStatusValues.includes(status)) || (type === 'attendance' && !attendanceStatusValues.includes(status)) || !['registrations', 'attendance'].includes(type))) {
    throw Object.assign(new Error('Filter status tidak sesuai dengan jenis laporan.'), { status: 422 });
  }

  const filters = { extracurricularId, from, to };
  const registrations = filteredActivityRecords(listRegistrations(), filters, 'registrationDate');
  const schedules = filteredActivityRecords(listSchedules(), filters, 'date');
  const attendance = filteredActivityRecords(listAttendance(), filters, 'date');
  const assessments = listAssessments({ extracurricularId, period }).filter((item) => !period || item.period === period);

  if (type === 'participants') {
    const rows = registrations.filter((item) => item.status === 'accepted').map((item) => ({ studentName: item.studentName, extracurricularName: item.extracurricularName, joinedAt: item.registrationDate.slice(0, 10) }));
    return table('Laporan Peserta Ekstrakurikuler', [{ key: 'studentName', label: 'Siswa' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'joinedAt', label: 'Tanggal pendaftaran' }], rows);
  }
  if (type === 'registrations') {
    const rows = registrations.filter((item) => !status || item.status === status).map((item) => ({ studentName: item.studentName, extracurricularName: item.extracurricularName, registrationDate: item.registrationDate.slice(0, 10), status: registrationLabels[item.status] }));
    return table('Laporan Pendaftaran', [{ key: 'studentName', label: 'Siswa' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'registrationDate', label: 'Tanggal daftar' }, { key: 'status', label: 'Status' }], rows);
  }
  if (type === 'attendance') {
    const rows = attendance.filter((item) => !status || item.status === status).map((item) => ({ date: item.date, extracurricularName: item.extracurricularName, studentName: item.studentName, status: attendanceLabels[item.status], notes: item.notes || '—' }));
    return table('Laporan Absensi', [{ key: 'date', label: 'Tanggal' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'studentName', label: 'Siswa' }, { key: 'status', label: 'Kehadiran' }, { key: 'notes', label: 'Catatan' }], rows);
  }
  if (type === 'assessments') {
    const rows = assessments.map((item) => ({ studentName: item.studentName, extracurricularName: item.extracurricularName, period: `Semester ${item.period.slice(-1)} ${item.period.slice(0, 4)}`, skillScore: item.skillScore, disciplineScore: item.disciplineScore, activityScore: item.activityScore, developmentNotes: item.developmentNotes || '—' }));
    return table('Laporan Penilaian dan Perkembangan', [{ key: 'studentName', label: 'Siswa' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'period', label: 'Periode' }, { key: 'skillScore', label: 'Skill' }, { key: 'disciplineScore', label: 'Disiplin' }, { key: 'activityScore', label: 'Keaktifan' }, { key: 'developmentNotes', label: 'Catatan perkembangan' }], rows);
  }
  if (type === 'activities') {
    const rows = schedules.map((item) => ({ date: item.date, day: item.day, extracurricularName: item.extracurricularName, time: `${item.startTime}–${item.endTime}`, location: item.location, coachName: item.coachName, status: item.status === 'changed' ? `Diubah: ${item.changeInformation}` : item.status === 'cancelled' ? `Dibatalkan: ${item.changeInformation}` : 'Terjadwal' }));
    return table('Laporan Kegiatan dan Jadwal', [{ key: 'date', label: 'Tanggal' }, { key: 'day', label: 'Hari' }, { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'time', label: 'Waktu' }, { key: 'location', label: 'Lokasi' }, { key: 'coachName', label: 'Pembina' }, { key: 'status', label: 'Informasi jadwal' }], rows);
  }

  const rows = listExtracurriculars()
    .filter((item) => !extracurricularId || item.id === extracurricularId)
    .map((activity) => {
      const activityRegistrations = registrations.filter((item) => item.extracurricularId === activity.id);
      const activitySchedules = schedules.filter((item) => item.extracurricularId === activity.id);
      const activityAttendance = attendance.filter((item) => item.extracurricularId === activity.id);
      const activityAssessments = assessments.filter((item) => item.extracurricularId === activity.id);
      return {
        extracurricularName: activity.name,
        coach: activity.coach,
        status: activity.status === 'active' ? 'Aktif' : 'Tidak aktif',
        participants: activityRegistrations.filter((item) => item.status === 'accepted').length,
        pendingRegistrations: activityRegistrations.filter((item) => item.status === 'pending').length,
        scheduleCount: activitySchedules.length,
        attendanceRecords: activityAttendance.length,
        assessmentCount: activityAssessments.length,
      };
    });
  return table('Rekap Ekstrakurikuler', [
    { key: 'extracurricularName', label: 'Ekstrakurikuler' }, { key: 'coach', label: 'Pembina' }, { key: 'status', label: 'Status' },
    { key: 'participants', label: 'Peserta' }, { key: 'pendingRegistrations', label: 'Pendaftaran menunggu' },
    { key: 'scheduleCount', label: 'Jadwal' }, { key: 'attendanceRecords', label: 'Catatan absensi' }, { key: 'assessmentCount', label: 'Penilaian' },
  ], rows);
}
