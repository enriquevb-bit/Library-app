import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { UserRole } from '@/types';

const extra = (Constants.expoConfig?.extra ?? {}) as { authUrl?: string };

// En prod la URL viene de app.json (extra.authUrl); en local, fallback por plataforma.
const AUTH_SERVER_URL = extra.authUrl
  ? extra.authUrl
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:9000'
    : 'http://localhost:9000';

const CLIENT_ID = 'oidc-client';
const CLIENT_SECRET = 'secret';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const ROLE_KEY = 'auth_role';
const EMAIL_KEY = 'auth_email';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Decode JWT payload (no verification — only to read claims)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url -> base64
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const decoded = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('binary');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractRoleFromToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const authorities = payload.authorities;
  if (Array.isArray(authorities)) {
    if (authorities.includes('ROLE_ADMIN')) return 'ADMIN';
    if (authorities.includes('ROLE_MEMBER')) return 'MEMBER';
  }
  return null;
}

function extractEmailFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return typeof payload.email === 'string' ? payload.email : null;
}

// Login with password grant (admin@gmail.com / miembro@gmail.com)
export async function login(email: string, password: string): Promise<UserRole> {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const body = `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&scope=openid`;

  const response = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body,
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new Error('Credenciales incorrectas');
    }
    throw new Error(`Error de autenticación: ${response.status}`);
  }

  const data: TokenResponse = await response.json();
  const role = extractRoleFromToken(data.access_token);
  const userEmail = extractEmailFromToken(data.access_token);

  if (!role) {
    throw new Error('El token no incluye un rol válido');
  }

  const expiryTime = Date.now() + (data.expires_in * 1000) - 60000; // 1 min margin
  await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
  await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
  await AsyncStorage.setItem(ROLE_KEY, role);
  if (userEmail) {
    await AsyncStorage.setItem(EMAIL_KEY, userEmail);
  }

  return role;
}

export async function getToken(): Promise<string | null> {
  const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
  const storedExpiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

  if (storedToken && storedExpiry && Date.now() < Number(storedExpiry)) {
    return storedToken;
  }

  // Token missing or expired — user must log in again
  await clearToken();
  return null;
}

export async function getStoredRole(): Promise<UserRole | null> {
  const role = await AsyncStorage.getItem(ROLE_KEY);
  if (role === 'ADMIN' || role === 'MEMBER') return role;
  return null;
}

export async function getStoredEmail(): Promise<string | null> {
  return AsyncStorage.getItem(EMAIL_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY, ROLE_KEY, EMAIL_KEY]);
}
