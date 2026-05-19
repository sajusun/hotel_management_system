import Axios from 'axios';

const axios = Axios.create({
  // Use same-origin requests (Vite proxy handles /api and /sanctum in dev)
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

export default axios;
