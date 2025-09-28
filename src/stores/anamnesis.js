import { defineStore } from 'pinia'
import { ref, computed } from 'vue';
import {
  getAnamnesisTemplates as apiGetTemplates,
  createAnamnesisTemplate as apiCreateTemplate,
  deleteAnamnesisTemplate as apiDeleteTemplate,
  getAnamnesisTemplateById as apiGetTemplateById,
  updateAnamnesisTemplate as apiUpdateTemplate,
  getPublicAnamnesis as apiGetPublic,
  submitPublicAnamnesis as apiSubmitPublic,
  assignAnamnesis as apiAssignAnamnesis,
  getAnamnesisForPatient as apiGetForPatient
} from '@/api/anamnesis'

export const useAnamnesisStore = defineStore('anamnesis', () => {
  const templates = ref([]);
  const publicTemplate = ref(null);
  const isLoading = ref(false);
  const patientAnamneses = ref([]);

  async function fetchTemplates() {
    isLoading.value = true
    try {
      const response = await apiGetTemplates()
      templates.value = response.data
    } catch (error) {
      console.error('Erro ao buscar modelos de anamnese:', error)
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Ação para criar um modelo
  async function createTemplate(templateData) {
    isLoading.value = true
    try {
      await apiCreateTemplate(templateData)
      await fetchTemplates() // Atualiza a lista após a criação
      return { success: true }
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTemplate(templateId) {
    isLoading.value = true
    try {
      await apiDeleteTemplate(templateId)
      await fetchTemplates() // Atualiza a lista após a exclusão
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTemplateById(templateId) {
    isLoading.value = true
    try {
      const response = await apiGetTemplateById(templateId)
      return response.data // Retorna os dados do modelo específico
    } catch (error) {
      console.error('Erro ao buscar modelo por ID:', error)
    } finally {
      isLoading.value = false
    }
  }

  // NOVA AÇÃO: Atualiza um modelo existente
  async function updateTemplate(templateId, templateData) {
    isLoading.value = true
    try {
      await apiUpdateTemplate(templateId, templateData)
      await fetchTemplates() // Atualiza a lista após a edição
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

    async function assignAnamnesis(patientId, templateId) {
    try {
      const response = await apiAssignAnamnesis(patientId, templateId);
      // O backend retorna o documento completo, incluindo o patientAccessToken
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao atribuir anamnese:", error);
      return { success: false, error };
    }
  }

  // Nova ação para buscar o formulário público
  async function fetchPublicTemplate(token) {
    isLoading.value = true;
    try {
      const response = await apiGetPublic(token);
      publicTemplate.value = response.data;
      return { success: true };
    } catch (error) {
      console.error("Erro ao buscar formulário público:", error);
      publicTemplate.value = null;
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

  // Nova ação para enviar as respostas do paciente
  async function submitPatientAnswers(token, answers) {
    try {
      await apiSubmitPublic(token, answers);
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      return { success: false, error };
    }
  }

  const answeredAnamneses = computed(() =>
    patientAnamneses.value.filter(a => a.status === 'Preenchido')
  );
  const pendingAnamneses = computed(() =>
    patientAnamneses.value.filter(a => a.status === 'Pendente')
  );

  // Nova ação para buscar as anamneses de um paciente
  async function fetchAnamnesisForPatient(patientId) {
    isLoading.value = true;
    try {
      const response = await apiGetForPatient(patientId);
      if (response.data && Array.isArray(response.data.data)) {
        patientAnamneses.value = response.data.data;
      } else {
        console.warn("A resposta da API para anamneses do paciente não continha um array 'data'.", response.data);
        patientAnamneses.value = [];
      }
    } catch (error) {
      console.error("Erro ao buscar anamneses do paciente:", error);
      patientAnamneses.value = [];
    } finally {
      isLoading.value = false;
    }
  }


  return {
    templates,
    publicTemplate,
    isLoading,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    fetchTemplateById,
    updateTemplate,
    assignAnamnesis,
    fetchPublicTemplate,
    submitPatientAnswers,
    patientAnamneses,
    answeredAnamneses,
    pendingAnamneses,
    fetchAnamnesisForPatient
  };
});
