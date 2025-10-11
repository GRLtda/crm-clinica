import apiClient from './index'

/**
 * Lista todos os funcionários ativos e convites pendentes.
 * Rota: GET /api/employees
 */
export const getEmployeesAndInvites = () => {
  return apiClient.get('/employees')
}

/**
 * Convida um novo funcionário para a clínica.
 * Rota: POST /api/employees/invite
 * @param {object} invitationData - Dados do convite { email, role }.
 */
export const inviteEmployee = (invitationData) => {
  return apiClient.post('/employees/invite', invitationData)
}

/**
 * Desativa (demite) um funcionário.
 * Rota: PUT /api/employees/:id/deactivate
 * @param {string} employeeId - O ID do funcionário.
 */
export const deactivateEmployee = (employeeId) => {
  return apiClient.delete(`/employees/${employeeId}/remove`)
}

/**
 * Atualiza o cargo de um funcionário.
 * Rota: PUT /api/employees/:id/role
 * @param {string} employeeId - O ID do funcionário.
 * @param {string} role - O novo cargo.
 */
export const updateEmployeeRole = (employeeId, role) => {
  return apiClient.put(`/employees/${employeeId}/role`, { role })
}

/**
 * Busca os detalhes de um convite a partir de um token.
 * Rota: GET /api/employees/invitation/:token
 * @param {string} token - O token de convite.
 */
export const getInvitationDetails = (token) => {
  return apiClient.get(`/employees/invitation/${token}`)
}
