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
    // Apenas salva no localStorage se o usuário não for nulo
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }

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
        // Para novos usuários sem clínica, a API pode retornar 403.
        // Retornamos o usuário atual que pode ser o 'basicUser' do registro.
        return user.value
      } else {
        // Para outros erros (ex: token inválido), limpamos tudo.
        logout()
        console.error('Erro ao buscar usuário, token pode ser inválido:', error)
        return null
      }
    }
  }

  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      const { token: authToken } = response.data // 1. Pegamos apenas o token

      setToken(authToken) // 2. Configuramos o token na API

      // 3. Buscamos os dados completos do usuário. A função fetchUser já vai chamar a setUser com os dados corretos.
      const fullUserData = await fetchUser()

      return { success: true, user: fullUserData }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error }
    }
  }

  async function register(userData) {
    try {
      const response = await apiRegister(userData)
      const { token: authToken } = response.data // 1. Pegamos apenas o token

      setToken(authToken) // 2. Configuramos o token

      // 3. Buscamos o usuário recém-criado.
      const newUser = await fetchUser()

      return { success: true, user: newUser }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error }
    }
  }

  function logout() {
    // Limpa o estado da store
    user.value = null
    token.value = null

    // Limpa o localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')

    // Limpa o cabeçalho da API e a store da clínica
    delete apiClient.defaults.headers.common['Authorization']
    const clinicStore = useClinicStore()
    clinicStore.setClinic(null)
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      await fetchUser() // Usamos await para garantir que os dados sejam carregados
    }
  }

  return { user, token, isAuthenticated, hasClinic, register, login, logout, checkAuth, fetchUser }
})
