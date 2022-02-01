import axios from 'axios';
import { getCookie, setCookie } from './helpers';
import { BACKEND_URI, SPOTIFY_URI } from './constants';

const axiosInstance = axios.create({
  baseURL: SPOTIFY_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {},
});

// before request, set the access token and country param
axiosInstance.interceptors.request.use(
  (config) => {
    const { url = '' } = config;
    const urlWithoutCountry = ['/me/top/tracks', '/me/top/artists'];
    if (urlWithoutCountry.includes(url) === false) {
      config.params.country = getCookie('country');
    }
    config.headers.Authorization = `Bearer ${getCookie('access_token')}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getCookie('refresh_token');
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.error.message === 'The access token expired' &&
      error.config &&
      !error.config._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      const response = await fetch(BACKEND_URI + '/refresh_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const res = await response.json();
      setCookie('access_token', res.access_token);
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
