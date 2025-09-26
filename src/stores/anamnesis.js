import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAnamnesisTemplates as apiGetTemplates } from '@/api/anamnesis';

export const useAnamnesisStore = defineStore('anamnesis', () => {
  const templates = ref([]);
  const isLoading = ref(false);

  async function fetchTemplates() {
    isLoading.value = true;
    try {
      const response = await apiGetTemplates();
      templates.value = response.data; // [cite: 28]
    } catch (error) {
      console.error("Erro ao buscar modelos de anamnese:", error);
      templates.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return { templates, isLoading, fetchTemplates };
});
