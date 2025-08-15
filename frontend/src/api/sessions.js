import axiosInstance from '../axiosConfig';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchSessions = (params = {}) =>
  axiosInstance.get('/api/sessions', { params, headers: authHeader() });

export const createSession = (payload) =>
  axiosInstance.post('/api/sessions', payload, { headers: authHeader() });

export const updateSession = (id, payload) =>
  axiosInstance.put(`/api/sessions/${id}`, payload, { headers: authHeader() });

export const deleteSession = (id) =>
  axiosInstance.delete(`/api/sessions/${id}`, { headers: authHeader() });
