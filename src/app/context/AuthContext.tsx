import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_URL = 'http://localhost:3000/api';
const STORAGE_KEY = 'ra_auth';

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  rol: 'cliente' | 'admin';
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

type ModalMode = 'login' | 'registro' | null;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  modalMode: ModalMode;
  openLogin: () => void;
  openRegistro: () => void;
  closeModal: () => void;
  login: (correo: string, contrasena: string) => Promise<void>;
  registro: (nombre: string, correo: string, telefono: string, contrasena: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: StoredAuth = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (data: StoredAuth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data.user);
    setToken(data.token);
  };

  const login = useCallback(async (correo: string, contrasena: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Credenciales incorrectas');
    }
    persist({ token: data.token, user: data.usuario });
  }, []);

  const registro = useCallback(async (nombre: string, correo: string, telefono: string, contrasena: string) => {
    const response = await fetch(`${API_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, telefono, contrasena }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo completar el registro');
    }
    persist({ token: data.token, user: data.usuario });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed: StoredAuth = JSON.parse(raw);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, user: next }));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const authFetch = useCallback((path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    // Si el body es FormData (subida de archivos), dejamos que el navegador
    // ponga su propio Content-Type con el boundary correcto.
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...options, headers });
  }, [token]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    modalMode,
    openLogin: () => setModalMode('login'),
    openRegistro: () => setModalMode('registro'),
    closeModal: () => setModalMode(null),
    login,
    registro,
    logout,
    updateUser,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}