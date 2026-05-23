import api from '../lib/axios';

type GetUsersParams = {
  page?: number;
  per_page?: number;
};

export const getUsers = (params: GetUsersParams = {}) => {
  return api.get('/users', { params });
};

export const getRoles = () => {
  return api.get('/roles');
};

export const createUser = (data: { name: string; email: string; roles: string[] }) => {
  return api.post('/users', data);
};

export const updateUser = (id: number, data: { name: string; email: string; roles: string[] }) => {
  return api.put(`/users/${id}`, data);
};

export const createRole = (name: string) => {
  return api.post('/roles', { name });
};
export const deleteUser = (id: number) => {
  return api.delete(`/users/${id}`);
};
