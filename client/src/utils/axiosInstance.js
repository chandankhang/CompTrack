import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for your backend
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;