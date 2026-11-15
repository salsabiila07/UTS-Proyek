import { getSessionToken } from './authService.js';

export async function apiRequest(path, options = {}) {
  const token = getSessionToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.message || 'Permintaan tidak dapat diproses.');
    error.status = response.status;
    error.errors = result?.errors || [];
    throw error;
  }
  return result.data;
}
