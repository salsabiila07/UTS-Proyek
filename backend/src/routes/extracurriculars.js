import { allowRoles, requireAuth } from '../middleware/auth.js';
import { createExtracurricular, deleteExtracurricular, findExtracurricular, listExtracurriculars, listManagedExtracurricularsForCoach, updateExtracurricular, validateExtracurricular } from '../services/extracurricularService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function rejectUnlessManager(request, response) {
  return allowRoles('admin', 'coach')(request, response);
}

function canManageActivity(user, activity) {
  return user.role === 'admin' || (user.role === 'coach' && activity?.coachId === user.id);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16384) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

function validateBody(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return { body: {}, errors: { body: 'Data permintaan tidak valid.' } };
  const body = {
    name: typeof values.name === 'string' ? values.name.trim() : values.name,
    description: typeof values.description === 'string' ? values.description.trim() : values.description ?? '',
    coach: typeof values.coach === 'string' ? values.coach.trim() : values.coach,
    day: values.day,
    startTime: values.startTime,
    endTime: values.endTime,
    location: typeof values.location === 'string' ? values.location.trim() : values.location,
    quota: values.quota,
    status: values.status,
    image: typeof values.image === 'string' ? values.image.trim() : values.image ?? '',
  };
  return { body, errors: validateExtracurricular(body) };
}

export async function extracurricularRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;

  const pathname = new URL(request.url, 'http://localhost').pathname;
  const match = pathname.match(/^\/api\/extracurriculars(?:\/([^/]+))?\/?$/);
  if (!match) {
    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
    return;
  }
  const id = match[1] ? decodeURIComponent(match[1]) : null;

  if (request.method === 'GET' && !id) {
    const data = auth.user.role === 'coach' ? listManagedExtracurricularsForCoach(auth.user.id) : listExtracurriculars();
    sendJson(response, 200, { success: true, message: 'Daftar ekstrakurikuler', data });
    return;
  }
  if (request.method === 'GET' && id) {
    const activity = findExtracurricular(id);
    if (!activity) sendJson(response, 404, { success: false, message: 'Ekstrakurikuler tidak ditemukan', errors: [] });
    else if (!canManageActivity(auth.user, activity) && auth.user.role === 'coach') sendJson(response, 403, { success: false, message: 'Ekstrakurikuler ini bukan tugas Anda', errors: [] });
    else sendJson(response, 200, { success: true, message: 'Detail ekstrakurikuler', data: activity });
    return;
  }
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
    return;
  }
  if (!rejectUnlessManager(request, response)) return;

  if (auth.user.role === 'coach' && id && !canManageActivity(auth.user, findExtracurricular(id))) {
    sendJson(response, 403, { success: false, message: 'Ekstrakurikuler ini bukan tugas Anda', errors: [] });
    return;
  }

  if (request.method === 'DELETE' && id) {
    if (!deleteExtracurricular(id)) sendJson(response, 404, { success: false, message: 'Ekstrakurikuler tidak ditemukan', errors: [] });
    else sendJson(response, 200, { success: true, message: 'Ekstrakurikuler berhasil dihapus', data: null });
    return;
  }
  if (request.method === 'DELETE') {
    sendJson(response, 400, { success: false, message: 'ID ekstrakurikuler wajib diisi', errors: [] });
    return;
  }
  if (request.method === 'POST' && id) {
    sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
    return;
  }
  if (['PUT', 'PATCH'].includes(request.method) && !id) {
    sendJson(response, 400, { success: false, message: 'ID ekstrakurikuler wajib diisi', errors: [] });
    return;
  }

  let values;
  try {
    values = await readBody(request);
  } catch {
    sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
    return;
  }
  let { body, errors } = validateBody(values);
  if (auth.user.role === 'coach') {
    body = { ...body, coach: auth.user.name, coachId: auth.user.id };
    errors = validateExtracurricular(body);
  }
  if (Object.keys(errors).length) {
    sendJson(response, 422, { success: false, message: 'Periksa kembali data ekstrakurikuler', errors: Object.entries(errors).map(([field, message]) => ({ field, message })) });
    return;
  }

  if (request.method === 'POST') {
    const activity = createExtracurricular(body);
    sendJson(response, 201, { success: true, message: 'Ekstrakurikuler berhasil ditambahkan', data: activity });
    return;
  }
  const activity = updateExtracurricular(id, body);
  if (!activity) sendJson(response, 404, { success: false, message: 'Ekstrakurikuler tidak ditemukan', errors: [] });
  else sendJson(response, 200, { success: true, message: 'Ekstrakurikuler berhasil diperbarui', data: activity });
}
