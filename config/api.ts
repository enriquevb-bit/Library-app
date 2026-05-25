import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; authUrl?: string };

// En prod la URL viene de app.json (extra.apiUrl); en local, fallback por plataforma.
const getBaseUrl = () => {
  if (extra.apiUrl) {
    return extra.apiUrl;
  }
  // El emulador de Android llega al host por 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getBaseUrl();
