import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getPatients as apiGetPatients,
  createPatient as apiCreatePatient,
  getPatientById as apiGetPatientById,
  updatePatient as apiUpdatePatient,
  deletePatient as apiDeletePatient
} from '@/api/patients';

export const usePatientsStore = defineStore('patients', () => {
  // --- STATE ---
  const patients = ref([]);
  const allPatients = ref([]); // Para preencher seletores em formulários
  const selectedPatient = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const isLoading = ref(false);

  // --- ACTIONS ---

  /**
   * Busca uma lista paginada de pacientes.
   * @param {object} params - Parâmetros de paginação, como { page: 1, limit: 10 }.
   */
  async function fetchPatients(page = 1) {
    isLoading.value = true;
    try {
      const response = await apiGetPatients({
        page: page,
        limit: pagination.value.limit,
      });
      if (response.data && Array.isArray(response.data.data)) {
        patients.value = response.data.data;
        const { total, pages, limit } = response.data;
        pagination.value = { total, page: response.data.page, pages, limit };
      } else {
        console.warn('A resposta da API de pacientes não tem o formato esperado.', response.data);
        patients.value = [];
      }
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      patients.value = [];
    } finally {
      isLoading.value = false;
    }
  }


  /**
   * Busca todos os pacientes sem paginação para uso em seletores.
   */
  async function fetchAllPatients() {
    try {
      // Usa um limite alto para garantir que todos os pacientes sejam retornados.
      const response = await apiGetPatients({ limit: 1000 });
      if (response.data && Array.isArray(response.data.data)) {
        allPatients.value = response.data.data;
      }
    } catch (error) {
      console.error("Erro ao buscar todos os pacientes:", error);
    }
  }

  /**
   * Cria um novo paciente.
   * @param {object} patientData - Os dados do novo paciente.
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  async function createPatient(patientData) {
    isLoading.value = true;
    try {
      await apiCreatePatient(patientData);
      await fetchPatients(); // Atualiza a lista da primeira página
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar paciente:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Busca um único paciente pelo seu ID.
   * @param {string} patientId - O ID do paciente.
   */
  async function fetchPatientById(patientId) {
    isLoading.value = true;
    selectedPatient.value = null;
    try {
      const response = await apiGetPatientById(patientId);
      selectedPatient.value = response.data;
    } catch (error) {
      console.error(`Erro ao buscar paciente ${patientId}:`, error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Atualiza os dados de um paciente.
   * @param {string} patientId - O ID do paciente a ser atualizado.
   * @param {object} patientData - Os novos dados do paciente.
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async function updatePatient(patientId, patientData) {
    isLoading.value = true;
    try {
      const response = await apiUpdatePatient(patientId, patientData);
      if (selectedPatient.value && selectedPatient.value._id === patientId) {
        selectedPatient.value = response.data;
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deleta um paciente.
   * @param {string} patientId - O ID do paciente a ser deletado.
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  async function deletePatient(patientId) {
    try {
      await apiDeletePatient(patientId);
      // Recarrega a página atual para refletir a remoção.
      await fetchPatients({ page: pagination.value.page });
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
      return { success: false, error };
    }
  }

  return {
    // State
    patients,
    allPatients,
    selectedPatient,
    pagination,
    isLoading,
    // Actions
    fetchPatients,
    fetchAllPatients,
    createPatient,
    fetchPatientById,
    updatePatient,
    deletePatient
  };
});
