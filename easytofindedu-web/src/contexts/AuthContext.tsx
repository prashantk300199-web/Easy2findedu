import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://easytofindedu.onrender.com/api/v1';

export type UserRole = 'student' | 'owner' | 'institute_owner';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData, role: UserRole) => Promise<void>;
  verifyOtp: (email: string, otp: string, role: UserRole) => Promise<void>;
  resendOtp: (email: string, role: UserRole) => Promise<void>;
  googleLogin: (idToken: string, role: UserRole, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getToken: () => string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  lastQualification?: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_CONFIG: Record<UserRole, { register: string; login: string; verifyOtp: string; resendOtp: string; logout: string }> = {
  student: {
    register: `${BASE}/student/auth/register`,
    login: `${BASE}/student/auth/login`,
    verifyOtp: `${BASE}/student/auth/verify-otp`,
    resendOtp: `${BASE}/student/auth/resend-otp`,
    logout: `${BASE}/student/auth/logout`,
  },
  owner: {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    verifyOtp: `${BASE}/auth/verify-otp`,
    resendOtp: `${BASE}/auth/resend-otp`,
    logout: `${BASE}/auth/logout`,
  },
  institute_owner: {
    register: `${BASE}/institute/auth/register`,
    login: `${BASE}/institute/auth/login`,
    verifyOtp: `${BASE}/institute/auth/verify-otp`,
    resendOtp: `${BASE}/institute/auth/resend-otp`,
    logout: `${BASE}/institute/auth/logout`,
  },
};

const USER_KEY = 'etf_user';
const TOKEN_KEY = 'etf_token';

function loadUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
}
function saveUser(user: AuthUser | null, token?: string | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}
function getStoredToken() { return localStorage.getItem(TOKEN_KEY); }

// Extract JWT from response — backend puts it in a cookie but also returns data
// We ask the backend to include the token in the response body too.
// As a fallback we read from document.cookie.
function extractToken(cookieName: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const COOKIE_NAMES: Record<UserRole, string> = {
  student: 'studentToken',
  owner: 'token',
  institute_owner: 'instituteOwnerToken',
};

async function post(url: string, body: object, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: loadUser(),
    loading: false,
    error: null,
  });

  const setLoading = () => setState((s) => ({ ...s, loading: true, error: null }));
  const setError = (error: string) => setState((s) => ({ ...s, loading: false, error }));
  const setUser = (user: AuthUser | null, token?: string | null) => {
    saveUser(user, token);
    setState({ user, loading: false, error: null });
  };

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    setLoading();
    try {
      const res = await post(ROLE_CONFIG[role].login, { email, password });
      // Try to get token from response body first, then from cookie
      const token = res.data?.token ?? res.token ?? extractToken(COOKIE_NAMES[role]);
      setUser({ ...res.data.user, role }, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    }
  }, []);

  const register = useCallback(async (data: RegisterData, role: UserRole) => {
    setLoading();
    try {
      await post(ROLE_CONFIG[role].register, data);
      setState((s) => ({ ...s, loading: false }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
      throw e;
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string, role: UserRole) => {
    setLoading();
    try {
      const res = await post(ROLE_CONFIG[role].verifyOtp, { email, otp });
      const token = res.data?.token ?? res.token ?? extractToken(COOKIE_NAMES[role]);
      setUser({ ...res.data.user, role }, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verification failed');
      throw e;
    }
  }, []);

  const resendOtp = useCallback(async (email: string, role: UserRole) => {
    try {
      await post(ROLE_CONFIG[role].resendOtp, { email });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend OTP');
      throw e;
    }
  }, []);

  const googleLogin = useCallback(async (idToken: string, role: UserRole, referralCode?: string) => {
    setLoading();
    try {
      const res = await post(`${BASE}/auth/google`, { idToken, role, referralCode });
      const token = res.data?.token ?? res.token ?? extractToken(COOKIE_NAMES[role]);
      setUser({ ...res.data.user, role: res.data.role }, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed');
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    const role = state.user?.role;
    const token = getStoredToken();
    if (role) {
      try {
        await fetch(ROLE_CONFIG[role].logout, {
          method: 'POST',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch { /* ignore */ }
    }
    setUser(null);
  }, [state.user?.role]);

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), []);
  const getToken = useCallback(() => getStoredToken(), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyOtp, resendOtp, googleLogin, logout, clearError, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
