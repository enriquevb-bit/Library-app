import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host localhost
// iOS simulator and web use localhost directly
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getBaseUrl();
