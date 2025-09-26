<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAnamnesisStore } from '@/stores/anamnesis';
import { FilePlus2, Pencil, Trash2 } from 'lucide-vue-next';
import CreateAnamnesisModal from '../modals/CreateAnamnesisModal.vue';

const anamnesisStore = useAnamnesisStore();
const templates = computed(() => anamnesisStore.templates);
const isModalOpen = ref(false);

onMounted(() => {
  anamnesisStore.fetchTemplates();
});

async function handleDelete(templateId) {
  if (confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
    await anamnesisStore.deleteTemplate(templateId);
  }
}
</script>

<template>
  <div>
    <CreateAnamnesisModal v-if="isModalOpen" @close="isModalOpen = false" />

    <div v-if="templates.length > 0" class="header-actions">
      <div>
        <h2>Modelos de Anamnese</h2>
        <p class="header-subtitle">Você tem {{ templates.length }} modelo(s) cadastrado(s).</p>
      </div>
      <button @click="isModalOpen = true" class="btn-primary">
        <FilePlus2 :size="16" />
        Criar Novo Modelo
      </button>
    </div>

    <div v-if="anamnesisStore.isLoading">Carregando modelos...</div>

    <div v-else-if="templates.length > 0" class="templates-grid">
      <div v-for="template in templates" :key="template._id" class="template-card">
        <span class="template-name">{{ template.name }}</span>
        <div class="template-actions">
          <button class="btn-icon" title="Editar">
            <Pencil :size="16" />
          </button>
          <button @click="handleDelete(template._id)" class="btn-icon btn-delete" title="Excluir">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="icon-wrapper"><FilePlus2 :size="48" /></div>
      <h3 class="empty-title">Nenhum modelo de anamnese encontrado</h3>
      <p class="empty-description">Crie seu primeiro modelo para agilizar o preenchimento de prontuários.</p>
      <button @click="isModalOpen = true" class="create-button">Criar Anamnese</button>
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.header-subtitle {
  margin-top: 0.25rem;
  color: var(--cinza-texto);
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
.btn-primary:hover { background-color: var(--azul-escuro); }

.templates-grid {
  display: grid;
  grid-template-columns: 1fr; /* Agora é uma lista, não mais um grid */
  gap: 0.75rem;
}
.template-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: box-shadow 0.2s ease;
}
.template-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.template-name {
  font-weight: 600;
}
.template-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--cinza-texto);
  transition: background-color 0.2s ease, color 0.2s ease;
}
.btn-icon:hover {
  background-color: #f3f4f6;
  color: var(--preto);
}
.btn-delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

/* Estilos do Empty State (sem alterações) */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; border: 2px dashed #d1d5db; border-radius: 1rem; background-color: rgba(239, 246, 255, 0.5); text-align: center; }
.icon-wrapper { color: var(--azul-principal); margin-bottom: 1.5rem; }
.empty-title { font-family: var(--fonte-titulo); font-size: 1.25rem; font-weight: 600; color: var(--preto); margin-bottom: 0.5rem; }
.empty-description { max-width: 400px; color: var(--cinza-texto); margin-bottom: 2rem; }
.create-button { padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease; }
.create-button:hover { background-color: var(--azul-escuro); }
</style>
