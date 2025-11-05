import apiClient from './index'

// Busca a lista de todos os modelos
export const getAnamnesisTemplates = () => {
  return apiClient.get('/anamnesis-templates')
}

// Cria um novo modelo
export const createAnamnesisTemplate = (templateData) => {
  return apiClient.post('/anamnesis-templates', templateData)
}

// Deleta um modelo pelo ID
export const deleteAnamnesisTemplate = (templateId) => {
  return apiClient.delete(`/anamnesis-templates/${templateId}`)
}

// Busca um modelo completo pelo ID
export const getAnamnesisTemplateById = (templateId) => {
  return apiClient.get(`/anamnesis-templates/${templateId}`)
}

// Atualiza um modelo pelo ID
export const updateAnamnesisTemplate = (templateId, templateData) => {
  return apiClient.put(`/anamnesis-templates/${templateId}`, templateData)
}

// Atribui uma anamnese (cria uma resposta pendente)
export const assignAnamnesis = (patientId, templateId) => {
  // O backend espera { templateId } no body
  return apiClient.post(`/patients/${patientId}/anamnesis`, { templateId })
}

// Busca o formulário público usando o token do paciente
export const getPublicAnamnesis = (token) => {
  return apiClient.get(`/anamnesis/public/${token}`)
}

export const submitPublicAnamnesis = (token, payload) => {
  return apiClient.put(`/anamnesis/public/${token}`, payload)
}

// Busca todas as respostas de anamnese de um paciente
export const getAnamnesisForPatient = (patientId) => {
  return apiClient.get(`/patients/${patientId}/anamnesis`)
}

// ✨ FUNÇÃO ADICIONADA ✨
// Médico atualiza as respostas de uma anamnese
export const updateAnamnesisResponse = (patientId, responseId, payload) => {
  // 'payload' é o objeto { answers: [...] }
  return apiClient.put(`/patients/${patientId}/anamnesis/${responseId}`, payload)
}
