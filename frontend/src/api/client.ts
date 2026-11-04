import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    const msg = error.response.data.message;
    if (Array.isArray(msg)) {
      return msg.join(', ');
    }
    return String(msg);
  }
  return error.message || 'Terjadi kesalahan pada server';
}

export default apiClient;
