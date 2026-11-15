const SESSION_KEY = 'sim-ekskul-session';

function getToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function getSessionToken() {
  return getToken();
}

function storeToken(token) {
  if (token) localStorage.setItem(SESSION_KEY, token);
  else localStorage.removeItem(SESSION_KEY);
}

async function request(path, options = {}, token = getToken()) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(result?.message || 'Tidak dapat terhubung ke layanan login');
  return result.data;
}

export const authService = {
  hasSession: () => Boolean(getToken()),

  async login(credentials) {
    const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }, null);
    storeToken(data.token);
    return data.user;
  },

  async restore() {
    const token = getToken();
    if (!token) return null;
    try {
      const data = await request('/api/auth/me', {}, token);
      return data.user;
    } catch {
      storeToken(null);
      return null;
    }
  },

  async logout() {
    const token = getToken();
    storeToken(null);
    if (token) await request('/api/auth/logout', { method: 'POST' }, token).catch(() => {});
  },
};
