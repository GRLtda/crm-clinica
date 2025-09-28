import apiClient from './index';

/**
 * Busca agendamentos dentro de um período de datas.
 * @param {object} params - Parâmetros de data.
 * @param {string} params.startDate - Data de início (YYYY-MM-DD).
 * @param {string} params.endDate - Data de fim (YYYY-MM-DD).
 * @returns {Promise}
 */
export const getAppointments = ({ startDate, endDate }) => {
  return apiClient.get('/appointments', {
    params: { startDate, endDate }
  });
};

export const createAppointment = (appointmentData) => {
  return apiClient.post('/appointments', appointmentData);
};
