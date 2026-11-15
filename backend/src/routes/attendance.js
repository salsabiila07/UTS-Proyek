import { allowRoles, requireAuth } from '../middleware/auth.js';
import { getScheduleAttendance, listAttendance, listCoachAttendance, listStudentAttendance, saveScheduleAttendance } from '../services/attendanceService.js';

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
    if (body.length > 32768) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

function handleServiceError(response, error) {
  sendJson(response, error.status || 500, { success: false, message: error.message || 'Absensi belum dapat diproses', errors: [] });
}

export async function attendanceRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;
  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;

  if (pathname === '/api/attendance/mine' && request.method === 'GET') {
    if (!requireRole(request, response, 'coach', 'student')) return;
    const isStudent = auth.user.role === 'student';
    const data = isStudent ? listStudentAttendance(auth.user.id) : listCoachAttendance(auth.user.id);
    sendJson(response, 200, { success: true, message: isStudent ? 'Riwayat absensi siswa' : 'Riwayat absensi pembina', data });
    return;
  }

  if (pathname === '/api/attendance' && request.method === 'GET') {
    if (!requireRole(request, response, 'admin')) return;
    const status = url.searchParams.get('status') || '';
    const date = url.searchParams.get('date') || '';
    const extracurricularId = url.searchParams.get('extracurricularId') || '';
    if (status && !['present', 'permission', 'sick', 'absent'].includes(status)) {
      sendJson(response, 400, { success: false, message: 'Filter status tidak valid', errors: [] });
      return;
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendJson(response, 400, { success: false, message: 'Filter tanggal tidak valid', errors: [] });
      return;
    }
    sendJson(response, 200, { success: true, message: 'Riwayat absensi', data: listAttendance({ status, date, extracurricularId }) });
    return;
  }

  const match = pathname.match(/^\/api\/attendance\/schedules\/([^/]+)\/?$/);
  if (!match) {
    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
    return;
  }
  if (!requireRole(request, response, 'coach')) return;
  const scheduleId = decodeURIComponent(match[1]);

  if (request.method === 'GET') {
    try {
      sendJson(response, 200, { success: true, message: 'Daftar peserta dan absensi', data: getScheduleAttendance(scheduleId, auth.user.id) });
    } catch (error) { handleServiceError(response, error); }
    return;
  }

  if (request.method === 'PUT') {
    let body;
    try { body = await readBody(request); } catch {
      sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
      return;
    }
    try {
      const saved = saveScheduleAttendance(scheduleId, auth.user.id, body?.entries);
      sendJson(response, 200, { success: true, message: 'Absensi berhasil disimpan', data: saved });
    } catch (error) { handleServiceError(response, error); }
    return;
  }

  sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
}
