import axios from 'axios';

const axiosInstance = axios.create();

const apiKey = import.meta.env.VITE_API_KEY;

axiosInstance.defaults.baseURL = '/api';
axiosInstance.defaults.timeout = 10000;
axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;

export default axiosInstance;
