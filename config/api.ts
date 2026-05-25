import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; authUrl?: string };

// URLs de los servidores arrancados a mano en la máquina de desarrollo.
// El emulador de Android llega al host por 10.0.2.2 en lugar de localhost.
const LOCAL_API = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api/v1'
  : 'http://localhost:8080/api/v1';
const LOCAL_AUTH = Platform.OS === 'android'
  ? 'http://10.0.2.2:9000'
  : 'http://localhost:9000';

// URLs de la nube (build de producción o cuando no hay servidores locales).
const CLOUD_API = extra.apiUrl ?? LOCAL_API;
const CLOUD_AUTH = extra.authUrl ?? LOCAL_AUTH;

export interface Endpoints {
  api: string;
  auth: string;
}

let resolved: Endpoints | null = null;
let resolving: Promise<Endpoints> | null = null;

// Comprueba si el servidor de autorización local responde. Usa 'no-cors' a propósito:
// solo nos interesa saber si hay algo escuchando, no leer la respuesta, de modo que la
// sonda funciona también en web sin depender de la configuración CORS del servidor.
async function isLocalServerUp(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    await fetch(`${LOCAL_AUTH}/.well-known/openid-configuration`, {
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

// Decide una sola vez qué backend usar y cachea el resultado durante la sesión:
//  - build de producción (Netlify): siempre la nube, sin sondear.
//  - desarrollo: el local si los servidores están arrancados; si no, la nube.
// Para volver a evaluar (p. ej. tras arrancar los servidores) basta con recargar la app.
export async function getEndpoints(): Promise<Endpoints> {
  if (resolved) return resolved;
  if (resolving) return resolving;

  resolving = (async () => {
    if (!__DEV__) {
      resolved = { api: CLOUD_API, auth: CLOUD_AUTH };
      return resolved;
    }
    const localUp = await isLocalServerUp();
    resolved = localUp
      ? { api: LOCAL_API, auth: LOCAL_AUTH }
      : { api: CLOUD_API, auth: CLOUD_AUTH };
    return resolved;
  })();

  return resolving;
}
