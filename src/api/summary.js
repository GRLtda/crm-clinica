import apiClient from './index'

export const getDashboardSummary = () => {
  return apiClient.get('/summary')
}
