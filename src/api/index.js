import axios from 'axios'

const apiClient = axios.create({
  // URL base da nossa API conforme a documentação
  baseURL: 'http://192.168.10.24:3001/api', // Ajustado de 3000 para 3001
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
