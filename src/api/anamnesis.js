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

export const assignAnamnesis = (patientId, templateId) => {
  const payload = { templateId, mode: 'Paciente' };
  return apiClient.post(`/patients/${patientId}/anamnesis`, payload);
};

// Busca o formulário público usando o token do paciente
export const getPublicAnamnesis = (token) => {
  return apiClient.get(`/anamnesis/public/${token}`);
};

// Paciente envia as respostas do formulário
export const submitPublicAnamnesis = (token, answers) => {
  return apiClient.put(`/anamnesis/public/${token}`, { answers });
};

export const getAnamnesisForPatient = (patientId) => {
  // Conforme sua documentação, a rota é GET /api/anamnesis/patients/:patientId/anamnesis
  return apiClient.get(`/patients/${patientId}/anamnesis`);
};
