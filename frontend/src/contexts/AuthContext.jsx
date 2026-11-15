import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => authService.hasSession() ? 'loading' : 'ready');

  useEffect(() => {
    if (!authService.hasSession()) return undefined;
    let active = true;
    authService.restore().then((restoredUser) => {
      if (!active) return;
      setUser(restoredUser);
      setStatus('ready');
    });
    return () => { active = false; };
  }, []);

  const login = useCallback((credentials) => authService.login(credentials), []);
  const completeLogin = useCallback((signedInUser) => {
    setUser(signedInUser);
    setStatus('ready');
  }, []);
  const logout = useCallback(async () => {
    setUser(null);
    setStatus('ready');
    await authService.logout();
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    login,
    completeLogin,
    logout,
  }), [completeLogin, login, logout, user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
