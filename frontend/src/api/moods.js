import axiosInstance from '../axiosConfig';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMoods = (params = {}) =>
  axiosInstance.get('/api/moods', { params, headers: authHeader() });

export const createMood = (payload) =>
  axiosInstance.post('/api/moods', payload, { headers: authHeader() });

export const updateMood = (id, payload) =>
  axiosInstance.put(`/api/moods/${id}`, payload, { headers: authHeader() });

export const deleteMood = (id) =>
  axiosInstance.delete(`/api/moods/${id}`, { headers: authHeader() });
