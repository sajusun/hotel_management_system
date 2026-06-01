import api from '../lib/axios';

export const getDashboardStats = () => {
  return api.get('/api/v1/dashboard/stats');
};
