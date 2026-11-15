import { findSession } from '../services/sessionService.js';

export function requireAuth(request, response) {
  const authorization = request.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  const session = scheme?.toLowerCase() === 'bearer' && token ? findSession(token) : null;

  if (!session) {
    response.writeHead(401, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ success: false, message: 'Sesi tidak valid atau sudah berakhir', errors: [] }));
    return null;
  }

  request.auth = { user: session.user, token };
  return request.auth;
}

export function allowRoles(...roles) {
  return (request, response) => {
    if (!request.auth || !roles.includes(request.auth.user.role)) {
      response.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ success: false, message: 'Anda tidak memiliki akses ke sumber daya ini', errors: [] }));
      return false;
    }
    return true;
  };
}
