import apiClient from './index';

// Cria uma nova entrada de prontuário
export const createRecord = (recordData) => {
  return apiClient.post('/records', recordData);
};

export const getByAppointmentId = (appointmentId) => {
  return apiClient.get(`/records/appointment/${appointmentId}`);
};
