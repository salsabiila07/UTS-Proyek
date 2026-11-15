import { allowRoles, requireAuth } from '../middleware/auth.js';
import { getAssessmentRoster, listAssessments, listCoachAssessments, saveAssessments } from '../services/assessmentService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 65536) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

function handleError(response, error) {
  sendJson(response, error.status || 500, { success: false, message: error.message || 'Penilaian belum dapat diproses', errors: [] });
}

export async function assessmentsRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;
  const url = new URL(request.url, 'http://localhost');
  const pathname = url.pathname;
  const extracurricularId = url.searchParams.get('extracurricularId') || '';
  const period = url.searchParams.get('period') || '';

  if (pathname === '/api/assessments' && request.method === 'GET') {
    if (!allowRoles('admin')(request, response)) return;
    sendJson(response, 200, { success: true, message: 'Daftar penilaian', data: listAssessments({ extracurricularId, period }) });
    return;
  }
  if (pathname === '/api/assessments/mine' && request.method === 'GET') {
    if (!allowRoles('coach')(request, response)) return;
    sendJson(response, 200, { success: true, message: 'Penilaian pembina', data: listCoachAssessments(auth.user.id, { extracurricularId, period }) });
    return;
  }
  if (pathname === '/api/assessments/roster' && request.method === 'GET') {
    if (!allowRoles('coach')(request, response)) return;
    if (!extracurricularId) {
      sendJson(response, 400, { success: false, message: 'Kegiatan wajib dipilih', errors: [] });
      return;
    }
    try {
      sendJson(response, 200, { success: true, message: 'Daftar peserta kegiatan', data: getAssessmentRoster(extracurricularId, auth.user.id) });
    } catch (error) { handleError(response, error); }
    return;
  }
  if (pathname === '/api/assessments' && request.method === 'PUT') {
    if (!allowRoles('coach')(request, response)) return;
    let body;
    try { body = await readBody(request); } catch {
      sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
      return;
    }
    try {
      const data = saveAssessments(auth.user.id, body.extracurricularId, body.period, body.entries);
      sendJson(response, 200, { success: true, message: 'Penilaian berhasil disimpan', data });
    } catch (error) { handleError(response, error); }
    return;
  }
  sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
}
