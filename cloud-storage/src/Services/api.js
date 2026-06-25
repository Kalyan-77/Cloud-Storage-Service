import axios from 'axios';
import { BASE_URL } from '../../config';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const listeners = new Set();

export const subscribeTo401 = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      listeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  }
);

export default api;
