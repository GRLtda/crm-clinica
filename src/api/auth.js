import apiClient from './index'

// Função para buscar os dados do usuário logado
export const getMe = () => {
  return apiClient.get('/auth/me')
}

// Função para registrar um novo usuário
export const register = (userData) => {
  return apiClient.post('/auth/register', userData)
}

// Função para fazer login
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials)
}
