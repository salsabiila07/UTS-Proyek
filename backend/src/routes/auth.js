import { createSession, deleteSession } from '../services/sessionService.js';
import { requireAuth } from '../middleware/auth.js';

const demoAccounts = process.env.NODE_ENV === 'development' || process.env.DEMO_AUTH === 'true' ? [
  { id: 'demo-admin', name: 'Admin Demo', username: 'admin', email: 'admin@giriharjo.sch.id', password: 'admin123', role: 'admin', status: 'active' },
  { id: 'demo-coach', name: 'Pembina Demo', username: 'pembina', email: 'pembina@giriharjo.sch.id', password: 'pembina123', role: 'coach', status: 'active' },
  { id: 'demo-student', name: 'Siswa Demo', username: 'siswa', email: 'siswa@giriharjo.sch.id', password: 'siswa123', role: 'student', status: 'active' },
  { id: 'demo-principal', name: 'Kepala Sekolah Demo', username: 'kepala', email: 'kepala@giriharjo.sch.id', password: 'kepala123', role: 'principal', status: 'active' },
] : [];

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8192) throw new Error('Ukuran permintaan terlalu besar');
  }
  return JSON.parse(body || '{}');
}

export async function authRouter(request, response) {
  const path = new URL(request.url, 'http://localhost').pathname;

  if (path === '/api/auth/login' && request.method === 'POST') {
    let credentials;
    try {
      credentials = await readBody(request);
    } catch {
      sendJson(response, 400, { success: false, message: 'Permintaan tidak valid', errors: [] });
      return;
    }

    const username = typeof credentials.username === 'string' ? credentials.username.trim().toLowerCase() : '';
    const password = typeof credentials.password === 'string' ? credentials.password : '';
    if (!username || !password) {
      sendJson(response, 400, { success: false, message: 'Nama pengguna dan kata sandi wajib diisi', errors: [] });
      return;
    }

    const account = demoAccounts.find((candidate) => (candidate.username === username || candidate.email === username) && candidate.password === password && candidate.status === 'active');
    if (!account) {
      sendJson(response, 401, { success: false, message: 'Nama pengguna atau kata sandi tidak sesuai', errors: [] });
      return;
    }

    const user = { id: account.id, name: account.name, username: account.username, role: account.role };
    const token = createSession(user);
    sendJson(response, 200, { success: true, message: 'Berhasil masuk', data: { user, token } });
    return;
  }

  if (path === '/api/auth/me' && request.method === 'GET') {
    const auth = requireAuth(request, response);
    if (auth) sendJson(response, 200, { success: true, message: 'Sesi aktif', data: { user: auth.user } });
    return;
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const auth = requireAuth(request, response);
    if (!auth) return;
    deleteSession(auth.token);
    sendJson(response, 200, { success: true, message: 'Berhasil keluar', data: null });
    return;
  }

  sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
}
