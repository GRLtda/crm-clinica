import apiClient from './index'

/**
 * Busca os logs de auditoria da clínica com paginação e filtros.
 * Rota: GET /api/audit
 * @param {object} params - Parâmetros de paginação e filtro (page, limit, userId, entity, etc.)
 */
export const getAuditLogs = (params) => {
  return apiClient.get('/audit', { params })
}
