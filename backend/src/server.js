import { createServer } from 'node:http';
import { authRouter } from './routes/auth.js';
import { extracurricularRouter } from './routes/extracurriculars.js';
import { registrationsRouter } from './routes/registrations.js';
import { schedulesRouter } from './routes/schedules.js';
import { attendanceRouter } from './routes/attendance.js';
import { assessmentsRouter } from './routes/assessments.js';
import { reportsRouter } from './routes/reports.js';
import { dashboardRouter } from './routes/dashboard.js';

const port = Number(process.env.PORT) || 3000;

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, { success: true, message: 'Backend siap', data: { status: 'ok' } });
      return;
    }

    if (request.url?.startsWith('/api/auth')) {
      await authRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/dashboard')) {
      await dashboardRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/extracurriculars')) {
      await extracurricularRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/registrations')) {
      await registrationsRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/schedules')) {
      await schedulesRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/attendance')) {
      await attendanceRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/assessments')) {
      await assessmentsRouter(request, response);
      return;
    }

    if (request.url?.startsWith('/api/reports')) {
      await reportsRouter(request, response);
      return;
    }

    sendJson(response, 404, { success: false, message: 'Rute tidak ditemukan', errors: [] });
  } catch {
    if (!response.headersSent) sendJson(response, 500, { success: false, message: 'Terjadi kesalahan pada server', errors: [] });
    else response.end();
  }
});

server.listen(port, () => {
  console.log(`SIM Ekstrakurikuler API berjalan di port ${port}`);
});
