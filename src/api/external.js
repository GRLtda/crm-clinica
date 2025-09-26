import axios from 'axios'

export const fetchAddressByCEP = async (cep) => {
  // Remove caracteres não numéricos do CEP
  const numericCep = cep.replace(/\D/g, '')
  if (numericCep.length !== 8) return null

  try {
    const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${numericCep}`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}
