import { allowRoles, requireAuth } from '../middleware/auth.js';
import { getRoleDashboard } from '../services/dashboardService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export async function dashboardRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;
  if (request.method !== 'GET' || new URL(request.url, 'http://localhost').pathname !== '/api/dashboard/mine') {
    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
    return;
  }
  if (!allowRoles('student', 'coach', 'principal')(request, response)) return;
  try {
    sendJson(response, 200, { success: true, message: 'Ringkasan dashboard', data: getRoleDashboard(auth.user) });
  } catch (error) {
    sendJson(response, error.status || 500, { success: false, message: error.message || 'Dashboard belum dapat dimuat', errors: [] });
  }
}
