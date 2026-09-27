import api from '../lib/axios';

export const getUsers = (page: number = 1, perPage: number = 10) => {
  return api.get('/api/v1/users', { params: { page, per_page: perPage } });
};

export const getRoles = () => {
  return api.get('/api/v1/roles');
};

export const createUser = (data: { name: string; email: string; roles: string[]; password?: string }) => {
  return api.post('/api/v1/users', data);
};

export const updateUser = (id: number, data: { name: string; email: string; roles: string[] }) => {
  return api.put(`/api/v1/users/${id}`, data);
};

export const createRole = (name: string) => {
  return api.post('/api/v1/roles', { name });
};

export const deleteUser = (id: number) => {
  return api.delete(`/api/v1/users/${id}`);
};
