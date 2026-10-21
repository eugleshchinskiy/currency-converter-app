import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    common: {
      Authorization: `Bearer ${apiKey}`,
    },
  },
});

export default axiosInstance;
