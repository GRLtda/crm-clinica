import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDashboardSummary } from '@/api/summary';

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref({
    stats: {
      pendingAnamnesis: 0,
      appointmentsToday: 0,
      totalPatients: 0,
      birthdaysMonth: 0
    },
    alerts: [],
    feed: []
  });

  const isLoading = ref(false);
  const error = ref(null);

  async function fetchDashboardStats() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await getDashboardSummary();
      // Assume que a resposta da API já vem no formato { stats:..., alerts:..., feed:... }
      // Se vier dentro de 'data', ajuste para response.data
      summary.value = response.data || response;

    } catch (err) {
      console.error("Erro ao buscar estatísticas do dashboard:", err);
      error.value = "Falha ao carregar dados do dashboard.";
    } finally {
      isLoading.value = false;
    }
  }

  return { summary, isLoading, error, fetchDashboardStats };
});
