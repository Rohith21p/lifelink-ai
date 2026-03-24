import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://lifelink-backend-5aum.onrender.com/api',
  timeout: 15_000,
});
