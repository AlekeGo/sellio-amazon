import axios from 'axios'

const DRAFT_KEY = 'sellio_guest_audit_draft'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      const hasDraft = !!localStorage.getItem(DRAFT_KEY)
      if (hasDraft && window.location.pathname === '/dashboard/new-audit') {
        window.location.href = '/login?next=%2Fdashboard%2Fnew-audit%3FresumeDraft%3D1'
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
