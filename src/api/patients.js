// api/patients.js

import apiClient from './index'

/**
 * Busca a lista de pacientes com paginação.
 * @param {object} params - Parâmetros de paginação.
 * @param {number} params.page - O número da página.
 * @param {number} params.limit - O número de itens por página.
 * @returns {Promise}
 */
export const getPatients = (params = {}) => {
  // Alteramos aqui para extrair os parâmetros de forma segura
  return apiClient.get('/patients', {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
    },
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
