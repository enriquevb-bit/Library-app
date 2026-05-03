import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AUTH_SERVER_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:9000'
  : 'http://localhost:9000';

const CLIENT_ID = 'oidc-client';
const CLIENT_SECRET = 'secret';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

async function fetchToken(): Promise<string> {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const response = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=openid',
  });

  if (!response.ok) {
    throw new Error(`Error de autenticacion: ${response.status}`);
  }

  const data: TokenResponse = await response.json();

  // Store token and expiry
  const expiryTime = Date.now() + (data.expires_in * 1000) - 60000; // 1 min margin
  await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
  await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));

  return data.access_token;
}

export async function getToken(): Promise<string> {
  const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
  const storedExpiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

  if (storedToken && storedExpiry && Date.now() < Number(storedExpiry)) {
    return storedToken;
  }

  // Token missing or expired, fetch new one
  return fetchToken();
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY]);
}
