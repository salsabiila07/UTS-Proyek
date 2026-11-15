import { allowRoles, requireAuth } from '../middleware/auth.js';
import { getReport } from '../services/reportService.js';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export async function reportsRouter(request, response) {
  const auth = requireAuth(request, response);
  if (!auth) return;
  if (!allowRoles('admin', 'principal')(request, response)) return;
  if (request.method !== 'GET') {
    sendJson(response, 405, { success: false, message: 'Metode tidak didukung', errors: [] });
    return;
  }
  const params = new URL(request.url, 'http://localhost').searchParams;
  try {
    const data = getReport({
      type: params.get('type') || '',
      extracurricularId: params.get('extracurricularId') || '',
      from: params.get('from') || '',
      to: params.get('to') || '',
      status: params.get('status') || '',
      period: params.get('period') || '',
    });
    sendJson(response, 200, { success: true, message: 'Laporan berhasil dimuat', data });
  } catch (error) {
    sendJson(response, error.status || 500, { success: false, message: error.message || 'Laporan belum dapat dimuat', errors: [] });
  }
}
