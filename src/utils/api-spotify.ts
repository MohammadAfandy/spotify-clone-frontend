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
  (error) => {
    return new Promise((resolve) => {
      const originalRequest = error.config;
      const refreshToken = getCookie('refresh_token');
      if (
        error.response &&
        error.response.status === 401 &&
        error.config &&
        !error.config.__isRetryRequest &&
        error.response.data.error.message === 'The access token expired' &&
        refreshToken
      ) {
        originalRequest._retry = true;

        const response = fetch(BACKEND_URI + '/refresh_token', {
          method: 'POST',
          // credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
          .then((res) => res.json())
          .then((res) => {
            setCookie('access_token', res.access_token);
          });
        resolve(response);
      }
      return Promise.reject(error);
    });
  }
);

export default axiosInstance;
