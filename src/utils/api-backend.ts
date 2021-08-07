import axios from 'axios';

import { BACKEND_URI } from './constants';

export default axios.create({
  baseURL: BACKEND_URI,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});
