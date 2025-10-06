import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { register as apiRegister, login as apiLogin, getMe } from '@/api/auth'
import apiClient from '@/api/index'
import { useClinicStore } from './clinic'

export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem('user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const hasClinic = computed(() => !!user.value?.clinic)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
    if (newUser?.clinic) {
      const clinicStore = useClinicStore()
      clinicStore.setClinic(newUser.clinic)
    }
  }

  async function fetchUser() {
    if (!token.value) return null
    try {
      const response = await getMe()
      setUser(response.data)
      return response.data
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return user.value
      } else {
        logout()
        console.error('Erro ao buscar usuário, token pode ser inválido:', error)
        return null
      }
    }
  }

  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      const { token: authToken, ...basicUser } = response.data

      // 1. Salva o token e os dados básicos do usuário IMEDIATAMENTE.
      setToken(authToken)
      setUser(basicUser)

      // 2. Tenta buscar os dados completos (com a clínica).
      const fullUserData = await fetchUser()
      return { success: true, user: fullUserData || basicUser }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error }
    }
  }

  async function register(userData) {
    try {
      const response = await apiRegister(userData)
      const { token: authToken, ...basicUser } = response.data

      // 1. Salva o token e os dados básicos do usuário IMEDIATAMENTE.
      setToken(authToken)
      setUser(basicUser)

      // 2. Chamamos fetchUser, que agora vai lidar com o erro 403 corretamente.
      await fetchUser()

      return { success: true, user: basicUser }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete apiClient.defaults.headers.common['Authorization']
    const clinicStore = useClinicStore()
    clinicStore.setClinic(null)
  }

  function checkAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser()
    }
  }

  return { user, token, isAuthenticated, hasClinic, register, login, logout, checkAuth, fetchUser }
})
