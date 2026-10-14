import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.api';
import { TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsReady(true);
      return () => {
        active = false;
      };
    }

    authApi.profile()
      .then((profile) => {
        if (active) setUser(profile);
      }).catch((requestError) => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setSessionError(`Phiên đăng nhập không hợp lệ hoặc máy chủ chưa sẵn sàng: ${requestError.message}`);
        }
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, result.access_token);
    try {
      const profile = await authApi.profile();
      setSessionError('');
      setUser(profile);
      return profile;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      throw error;
    }
  }, []);

  const register = useCallback((credentials) => authApi.register(credentials), []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setSessionError('');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isReady,
    sessionError,
    login,
    register,
    logout,
  }), [user, isReady, sessionError, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return context;
}
