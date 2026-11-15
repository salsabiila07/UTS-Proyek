import { allowRoles, requireAuth } from '../middleware/auth.js';
import { createRegistration, findRegistration, listCoachRegistrations, listRegistrations, listStudentRegistrations, setRegistrationStatus } from '../services/registrationService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function requireRole(request, response, role) {
  return allowRoles(role)(request, response);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8192) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

export async function registrationsRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;

  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  if (pathname === '/api/registrations/mine' && request.method === 'GET') {
    if (!requireRole(request, response, 'student')) return;
    sendJson(response, 200, { success: true, message: 'Pendaftaran siswa', data: listStudentRegistrations(auth.user.id) });
    return;
  }

  if (pathname === '/api/registrations/coach' && request.method === 'GET') {
    if (!requireRole(request, response, 'coach')) return;
    sendJson(response, 200, { success: true, message: 'Peserta kegiatan pembina', data: listCoachRegistrations(auth.user.id) });
    return;
  }

  if (pathname === '/api/registrations' && request.method === 'GET') {
    if (!requireRole(request, response, 'admin')) return;
    const status = url.searchParams.get('status');
    if (status && !['pending', 'accepted', 'rejected'].includes(status)) {
      sendJson(response, 400, { success: false, message: 'Filter status tidak valid', errors: [] });
      return;
    }
    sendJson(response, 200, { success: true, message: 'Daftar pendaftaran', data: listRegistrations(status) });
    return;
  }

  if (pathname === '/api/registrations' && request.method === 'POST') {
    if (!requireRole(request, response, 'student')) return;
    let body;
    try { body = await readBody(request); } catch {
      sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
      return;
    }
    const studentName = typeof body?.studentName === 'string' ? body.studentName.trim() : '';
    const studentClass = typeof body?.studentClass === 'string' ? body.studentClass.trim() : '';
    const errors = [];
    if (typeof body?.extracurricularId !== 'string' || !body.extracurricularId.trim()) errors.push({ field: 'extracurricularId', message: 'Ekstrakurikuler wajib dipilih.' });
    if (studentName.length < 2 || studentName.length > 80) errors.push({ field: 'studentName', message: 'Nama wajib diisi (2–80 karakter).' });
    if (studentClass.length < 1 || studentClass.length > 30) errors.push({ field: 'studentClass', message: 'Kelas wajib diisi (maksimal 30 karakter).' });
    if (errors.length) {
      sendJson(response, 422, { success: false, message: 'Nama, kelas, dan ekstrakurikuler wajib diisi dengan benar', errors });
      return;
    }
    try {
      const registration = createRegistration(auth.user, body.extracurricularId.trim(), { studentName, studentClass });
      sendJson(response, 201, { success: true, message: 'Pendaftaran berhasil dikirim', data: registration });
    } catch (error) {
      sendJson(response, error.status || 500, { success: false, message: error.message || 'Pendaftaran gagal diproses', errors: [] });
    }
    return;
  }

  const registrationMatch = pathname.match(/^\/api\/registrations\/([^/]+)\/?$/);
  if (!registrationMatch) {
    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
    return;
  }
  const id = decodeURIComponent(registrationMatch[1]);

  if (request.method === 'GET') {
    const registration = findRegistration(id);
    if (!registration) sendJson(response, 404, { success: false, message: 'Pendaftaran tidak ditemukan', errors: [] });
    else if (auth.user.role !== 'admin' && !(auth.user.role === 'student' && registration.studentId === auth.user.id)) {
      sendJson(response, 403, { success: false, message: 'Anda tidak memiliki akses ke pendaftaran ini', errors: [] });
    } else sendJson(response, 200, { success: true, message: 'Detail pendaftaran', data: registration });
    return;
  }

  if (request.method === 'PATCH') {
    if (!requireRole(request, response, 'admin')) return;
    let body;
    try { body = await readBody(request); } catch {
      sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
      return;
    }
    if (!['accepted', 'rejected'].includes(body?.status)) {
      sendJson(response, 422, { success: false, message: 'Status pendaftaran tidak valid', errors: [{ field: 'status', message: 'Pilih diterima atau ditolak.' }] });
      return;
    }
    try {
      const registration = setRegistrationStatus(id, body.status);
      if (!registration) sendJson(response, 404, { success: false, message: 'Pendaftaran tidak ditemukan', errors: [] });
      else sendJson(response, 200, { success: true, message: `Pendaftaran berhasil ${body.status === 'accepted' ? 'diterima' : 'ditolak'}`, data: registration });
    } catch (error) {
      sendJson(response, error.status || 500, { success: false, message: error.message || 'Pendaftaran gagal diproses', errors: [] });
    }
    return;
  }

  sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
}
