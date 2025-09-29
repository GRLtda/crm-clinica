import apiClient from './index'

// Função para criar uma nova clínica
export const createClinic = (clinicData) => {
  return apiClient.post('/clinics', clinicData)
}

export const updateClinic = (clinicData) => {
  return apiClient.put('/clinics', clinicData) //
}

export const getClinicSummary = () => {
  return apiClient.get('/clinics/summary');
};
