import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;

axios.defaults.baseURL = '/api';
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;

export default axios;
