import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, org: Organization) => void;
  logout: () => void;
  demoLogin: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('daymark_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    try {
      const res = await api.getMe();
      if (res.user && res.organization) {
        setUser(res.user);
        setOrganization(res.organization);
      }
    } catch (err) {
      console.warn('[Auth] Session expired or invalid');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshMe();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User, newOrg: Organization) => {
    localStorage.setItem('daymark_token', newToken);
    localStorage.setItem('daymark_org_id', newOrg.id);
    setToken(newToken);
    setUser(newUser);
    setOrganization(newOrg);
  };

  const logout = () => {
    localStorage.removeItem('daymark_token');
    localStorage.removeItem('daymark_org_id');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login({
        email: 'founder@daymark.io',
        password: 'DaymarkSecure2026!'
      });
      login(res.token, res.user, res.organization);
    } catch (err) {
      console.error('[Demo Login Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, organization, token, isLoading, login, logout, demoLogin, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
