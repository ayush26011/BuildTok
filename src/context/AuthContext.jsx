import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('buildtok_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    const loggedUser = { ...mockUsers[0], email };
    setUser(loggedUser);
    localStorage.setItem('buildtok_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name, username, email, password) => {
    await new Promise(r => setTimeout(r, 1400));
    const newUser = {
      ...mockUsers[0],
      id: 'u_new',
      name,
      username: `@${username}`,
      email,
      avatarInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      followers: 0,
      following: 0,
      projects: 0,
      totalLikes: 0,
      verified: false,
      badge: 'New Creator',
    };
    setUser(newUser);
    localStorage.setItem('buildtok_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('buildtok_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
