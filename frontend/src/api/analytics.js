import { api } from './client'

export const analyticsApi = {
  overview: (params = {}) => api.get('/analytics/overview', { params }),
  monthDetail: (year, month) => api.get(`/analytics/months/${year}/${month}`),
  topProducts: (params = {}) => api.get('/analytics/top-products', { params }),
}