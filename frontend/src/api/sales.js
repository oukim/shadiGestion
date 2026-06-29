import { api } from './client'

export const salesApi = {
  list: (params = {}) => api.get('/sales', { params }),
  get: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
}