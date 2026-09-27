import api from '../lib/axios';

type GetAuditParams = {
  page?: number;
  per_page?: number;
  search?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
};

export const getAuditLogs = (params: GetAuditParams = {}) => {
  return api.get('/api/v1/audit-logs', { params });
};
