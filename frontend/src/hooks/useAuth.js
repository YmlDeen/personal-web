import { create } from 'zustand'
import api from '../api/client'

const useAuth = create((set) => ({
  user: localStorage.getItem('access_token') ? { loggedIn: true } : null,

  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    set({ user: { loggedIn: true } })
  },

  logout: () => {
    localStorage.clear()
    set({ user: null })
  }
}))

export default useAuth
