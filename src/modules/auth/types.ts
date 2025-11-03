/**
 * Auth Module Types
 */

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  city?: string;
  avatarUrl?: string;
  isPhoneVerified: boolean;
}

export interface LoginForm {
  phone: string;
  otp?: string;
}
