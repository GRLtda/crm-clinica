// src/stores/records.js
import { defineStore } from 'pinia'
import { createRecord, getByAppointmentId } from '@/api/records' // Importe a nova função getByAppointmentId

export const useRecordsStore = defineStore('records', {
  state: () => ({
    allRecords: [], // Assumindo que você possa ter uma lista de prontuários
    currentRecord: null, // Guarda o registro sendo visualizado
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * Cria uma nova entrada de prontuário no banco de dados.
     * @param {object} recordData - Os dados para o novo registro.
     */
    async createRecord(recordData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await createRecord(recordData)
        // Opcional: Adicionar o novo registro ao estado `allRecords`
        this.allRecords.unshift(response.data)
        return { success: true, data: response.data }
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao criar o prontuário.'
        console.error('Falha em createRecord:', err)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Busca um registro de prontuário específico pelo ID do agendamento.
     * @param {string} appointmentId - O ID do agendamento.
     */
    async fetchRecordByAppointmentId(appointmentId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await getByAppointmentId(appointmentId)
        this.currentRecord = response.data
        return { success: true, data: response.data }
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao buscar o prontuário.'
        console.error('Falha em fetchRecordByAppointmentId:', err)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },
  },
})
