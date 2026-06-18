import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('buildtok_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('buildtok_user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Failed to fetch current user profile:', err);
      // Only logout if token is invalid or expired (401 / 403)
      if (err.status === 401 || err.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('buildtok_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success && response.data) {
      const { token, ...loggedUser } = response.data;
      setUser(loggedUser);
      localStorage.setItem('buildtok_token', token);
      localStorage.setItem('buildtok_user', JSON.stringify(loggedUser));
      return loggedUser;
    }
    throw new Error('Invalid email or password');
  };

  const register = async (name, username, email, password) => {
    const response = await authService.register(name, username, email, password);
    if (response.success && response.data) {
      const { token, ...newUser } = response.data;
      setUser(newUser);
      localStorage.setItem('buildtok_token', token);
      localStorage.setItem('buildtok_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error('Registration failed');
  };

  const logout = (callback) => {
    setUser(null);
    localStorage.removeItem('buildtok_token');
    localStorage.removeItem('buildtok_user');
    if (typeof callback === 'function') callback();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
