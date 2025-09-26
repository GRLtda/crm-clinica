<script setup>
import { onMounted, computed } from 'vue';
import { useAnamnesisStore } from '@/stores/anamnesis';
import { FilePlus2 } from 'lucide-vue-next';

const anamnesisStore = useAnamnesisStore();
const templates = computed(() => anamnesisStore.templates);

onMounted(() => {
  anamnesisStore.fetchTemplates();
});
</script>

<template>
  <div>
    <div v-if="anamnesisStore.isLoading">Carregando modelos...</div>

    <div v-else-if="templates.length > 0">
      <p>Você tem {{ templates.length }} modelo(s) criado(s).</p>
    </div>

    <div v-else class="empty-state">
      <div class="icon-wrapper">
        <FilePlus2 :size="48" />
      </div>
      <h3 class="empty-title">Nenhum modelo de anamnese encontrado</h3>
      <p class="empty-description">Crie seu primeiro modelo para agilizar o preenchimento de prontuários durante os atendimentos.</p>
      <button class="create-button">Criar Modelo de Anamnese</button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  border: 2px dashed #d1d5db;
  border-radius: 1rem;
  background-color: rgba(239, 246, 255, 0.5); /* Azul sutil meio branco */
  text-align: center;
}
.icon-wrapper {
  color: var(--azul-principal);
  margin-bottom: 1.5rem;
}
.empty-title {
  font-family: var(--fonte-titulo);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--preto);
  margin-bottom: 0.5rem;
}
.empty-description {
  max-width: 400px;
  color: var(--cinza-texto);
  margin-bottom: 2rem;
}
.create-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.create-button:hover {
  background-color: var(--azul-escuro);
}
</style>
