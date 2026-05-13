import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const url = String(config.url || '');
  const method = String(config.method || 'get').toLowerCase();
  const customerToken = localStorage.getItem('sawad_customer_token');
  const adminToken = localStorage.getItem('sawad_token');
  const needsCustomer = url.startsWith('/wallet/me') || url.startsWith('/my-orders') || (url.startsWith('/orders') && method === 'post') || (url.startsWith('/wallet-topups') && method === 'post');
  const token = needsCustomer ? customerToken : (adminToken || customerToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
