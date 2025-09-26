import apiClient from './index'

/**
 * Busca a lista de pacientes com paginação.
 * @param {object} params - Parâmetros de paginação.
 * @param {number} params.page - O número da página.
 * @param {number} params.limit - O número de itens por página.
 * @returns {Promise}
 */
export const getPatients = ({ page = 1, limit = 10 }) => {
  return apiClient.get('/patients', {
    params: { page, limit },
  })
}

export const createPatient = (patientData) => {
  return apiClient.post('/patients', patientData)
}

export const getPatientById = (patientId) => {
  return apiClient.get(`/patients/${patientId}`);
};

export const updatePatient = (patientId, patientData) => {
  return apiClient.put(`/patients/${patientId}`, patientData);
};

export const deletePatient = (patientId) => {
  return apiClient.delete(`/patients/${patientId}`);
};
