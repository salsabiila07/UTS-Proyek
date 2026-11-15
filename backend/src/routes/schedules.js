import { allowRoles, requireAuth } from '../middleware/auth.js';
import { listExtracurricularsForCoach } from '../services/extracurricularService.js';
import { canCoachManageSchedule, canCoachScheduleActivity, createSchedule, deleteSchedule, findSchedule, listSchedules, listSchedulesForUser, listWeeklySchedules, normalizeSchedule, updateSchedule, validateSchedule } from '../services/scheduleService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function requireRole(request, response, ...roles) {
  return allowRoles(...roles)(request, response);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16384) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

function scheduleBody(values, allowInactiveActivity) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return { body: {}, errors: { body: 'Data jadwal tidak valid.' } };
  const body = {
    extracurricularId: values.extracurricularId,
    date: values.date,
    day: values.day,
    startTime: values.startTime,
    endTime: values.endTime,
    location: typeof values.location === 'string' ? values.location.trim() : '',
    coachId: values.coachId,
    status: values.status,
    changeInformation: typeof values.changeInformation === 'string' ? values.changeInformation.trim() : '',
  };
  return { body, errors: validateSchedule(body, { allowInactiveActivity }) };
}

export async function schedulesRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;

  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/api/schedules/timetable' && request.method === 'GET') {
    if (!requireRole(request, response, 'admin', 'coach', 'student', 'principal')) return;
    sendJson(response, 200, { success: true, message: 'Jadwal rutin ekstrakurikuler', data: listWeeklySchedules() });
    return;
  }
  if (pathname === '/api/schedules/mine/activities' && request.method === 'GET') {
    if (!requireRole(request, response, 'coach')) return;
    sendJson(response, 200, { success: true, message: 'Ekstrakurikuler tugas pembina', data: listExtracurricularsForCoach(auth.user.id) });
    return;
  }
  if (pathname === '/api/schedules/mine' && request.method === 'GET') {
    if (!requireRole(request, response, 'coach', 'student')) return;
    sendJson(response, 200, { success: true, message: 'Jadwal sesuai akun', data: listSchedulesForUser(auth.user) });
    return;
  }

  const match = pathname.match(/^\/api\/schedules(?:\/([^/]+))?\/?$/);
  if (!match) {
    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
    return;
  }
  const id = match[1] ? decodeURIComponent(match[1]) : null;

  if (request.method === 'GET' && !id) {
    if (!requireRole(request, response, 'admin')) return;
    sendJson(response, 200, { success: true, message: 'Daftar jadwal', data: listSchedules() });
    return;
  }
  if (request.method === 'GET' && id) {
    if (!requireRole(request, response, 'admin')) return;
    const schedule = findSchedule(id);
    if (!schedule) sendJson(response, 404, { success: false, message: 'Jadwal tidak ditemukan', errors: [] });
    else sendJson(response, 200, { success: true, message: 'Detail jadwal', data: schedule });
    return;
  }
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
    return;
  }
  if (!requireRole(request, response, 'admin', 'coach')) return;

  if (request.method === 'DELETE' && id) {
    const existing = findSchedule(id);
    if (!existing) {
      sendJson(response, 404, { success: false, message: 'Jadwal tidak ditemukan', errors: [] });
      return;
    }
    if (auth.user.role === 'coach' && !canCoachManageSchedule(auth.user, existing)) {
      sendJson(response, 403, { success: false, message: 'Anda hanya dapat menghapus jadwal ekstrakurikuler tugas Anda', errors: [] });
      return;
    }
    if (!deleteSchedule(id)) sendJson(response, 404, { success: false, message: 'Jadwal tidak ditemukan', errors: [] });
    else sendJson(response, 200, { success: true, message: 'Jadwal berhasil dihapus', data: null });
    return;
  }
  if (request.method === 'DELETE' || (!id && ['PUT', 'PATCH'].includes(request.method))) {
    sendJson(response, 400, { success: false, message: 'ID jadwal wajib diisi', errors: [] });
    return;
  }
  if (request.method === 'POST' && id) {
    sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
    return;
  }

  let values;
  try { values = await readBody(request); } catch {
    sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
    return;
  }
  const scheduleValues = auth.user.role === 'coach' && values && typeof values === 'object' && !Array.isArray(values)
    ? { ...values, coachId: auth.user.id }
    : values;
  const { body, errors } = scheduleBody(scheduleValues, request.method !== 'POST');
  const existing = id ? findSchedule(id) : null;
  if (auth.user.role === 'coach') {
    if (id && (!existing || !canCoachManageSchedule(auth.user, existing))) {
      sendJson(response, existing ? 403 : 404, { success: false, message: existing ? 'Anda hanya dapat mengubah jadwal ekstrakurikuler tugas Anda' : 'Jadwal tidak ditemukan', errors: [] });
      return;
    }
    if (!canCoachScheduleActivity(auth.user, body.extracurricularId)) {
      sendJson(response, 403, { success: false, message: 'Ekstrakurikuler ini tidak ditugaskan kepada Anda', errors: [] });
      return;
    }
  }
  if (Object.keys(errors).length) {
    sendJson(response, 422, { success: false, message: 'Periksa kembali data jadwal', errors: Object.entries(errors).map(([field, message]) => ({ field, message })) });
    return;
  }

  try {
    if (request.method === 'POST') {
      sendJson(response, 201, { success: true, message: 'Jadwal berhasil ditambahkan', data: createSchedule(normalizeSchedule(body)) });
      return;
    }
    const schedule = updateSchedule(id, normalizeSchedule(body));
    if (!schedule) sendJson(response, 404, { success: false, message: 'Jadwal tidak ditemukan', errors: [] });
    else sendJson(response, 200, { success: true, message: 'Jadwal berhasil diperbarui', data: schedule });
  } catch (error) {
    sendJson(response, error.status || 500, { success: false, message: error.message || 'Jadwal gagal disimpan', errors: [] });
  }
}
