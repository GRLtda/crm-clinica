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
  const patients = ref([]);
  const selectedPatient = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const isLoading = ref(false);

  async function fetchPatients(params = {}) {
    isLoading.value = true;
    try {
      const response = await apiGetPatients({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
      });
      patients.value = response.data.data;
      const { total, page, pages, limit } = response.data;
      pagination.value = { total, page, pages, limit };
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      patients.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // A função que estava faltando ou incompleta
  async function createPatient(patientData) {
    isLoading.value = true;
    try {
      await apiCreatePatient(patientData);
      await fetchPatients(); // Atualiza a lista após a criação
      return { success: true };
    } catch (error)
 {
      console.error("Erro ao criar paciente:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

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

  async function updatePatient(patientId, patientData) {
    isLoading.value = true;
    try {
      const response = await apiUpdatePatient(patientId, patientData);
      // Atualiza o paciente selecionado, se ele estiver carregado
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

  // NOVA AÇÃO: Deleta um paciente
  async function deletePatient(patientId) {
    try {
      await apiDeletePatient(patientId);
      await fetchPatients(); // Recarrega a lista
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
      return { success: false, error };
    }
  }

  // Certifique-se de que a função está sendo retornada aqui
  return { patients, selectedPatient, pagination, isLoading, fetchPatients, createPatient, fetchPatientById, updatePatient, deletePatient };
});
