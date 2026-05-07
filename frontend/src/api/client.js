import axios from 'axios'

const api = axios.create({ baseURL: '/' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

let refreshing = false
let queue = []

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(token => {
          orig.headers.Authorization = `Bearer ${token}`
          return api(orig)
        })
      }
      refreshing = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post('/auth/refresh', { token: refresh })
        localStorage.setItem('access_token', data.access)
        queue.forEach(p => p.resolve(data.access))
        queue = []
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch (e) {
        queue.forEach(p => p.reject(e))
        queue = []
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
