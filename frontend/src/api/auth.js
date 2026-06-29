import { api } from './client'

export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  changePassword: (data) => api.post('/change-password', data),
  
}