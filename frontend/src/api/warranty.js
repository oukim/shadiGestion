import { api } from './client'

export const warrantyApi = {
  get: (warrantyNumber) => api.get(`/warranties/${warrantyNumber}`),
  downloadPdf: (warrantyNumber) =>
    api.get(`/warranties/${warrantyNumber}/pdf`, { responseType: 'blob' }),
}