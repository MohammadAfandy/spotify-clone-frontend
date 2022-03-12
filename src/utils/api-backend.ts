import axios from 'axios';
import { toast } from 'react-toastify';

import { BACKEND_URI } from './constants';

const axiosInstance = axios.create({
  baseURL: BACKEND_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
  params: {},
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    toast.error(`Something went wrong`);
    return Promise.reject(error);
  }
);

export default axiosInstance;
