import axios from 'axios';
import {
  getCookie,
  setCookie,
  // sleep,
} from './helpers';
import { ACCESS_TOKEN_AGE, BACKEND_URI, SPOTIFY_URI } from './constants';

const axiosInstance = axios.create({
  baseURL: SPOTIFY_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  params: {},
});

// before request, set the access token and country param
axiosInstance.interceptors.request.use(
  async (config) => {
    // await sleep(3000);
    const { url = '', method } = config;
    const urlWithoutCountry = ['/me/top/tracks', '/me/top/artists'];
    if (
      method?.toLowerCase() === 'get'
      && urlWithoutCountry.includes(url) === false
      && url.startsWith('/me/player') === false
    ) {
      config.params.country = getCookie('country') || 'US';
    }

    const accessToken = getCookie('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${getCookie('access_token')}`;
    }
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
    // const refreshToken = getCookie('refresh_token');
    if (
      error.response &&
      error.config &&
      !error.config._retry
      // refreshToken
    ) {
      const isExpired = (
        error.response.status === 401 &&
        error.response.data.error.message === 'The access token expired'
      );
      const accessToken = getCookie('access_token');

      // refresh token when expired or access cookie token is deleted
      if (isExpired || !accessToken) {
        originalRequest._retry = true;
  
        const response = await fetch(BACKEND_URI + '/refresh_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          // body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const res = await response.json();
        if (res.access_token) {
          setCookie('access_token', res.access_token, { expires: ACCESS_TOKEN_AGE });
          return axiosInstance(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
