<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patients';
import { useToast } from 'vue-toastification';
import { UserPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next';

const patientsStore = usePatientsStore();
const router = useRouter();
const toast = useToast();

const patients = computed(() => patientsStore.patients);
const pagination = computed(() => patientsStore.pagination);
const actionsMenuOpenFor = ref(null);

onMounted(() => {
  patientsStore.fetchPatients();
});

function goToPatient(patientId) {
  router.push(`/app/pacientes/${patientId}`);
}

function toggleActionsMenu(patientId) {
  actionsMenuOpenFor.value = actionsMenuOpenFor.value === patientId ? null : patientId;
}

async function handleDelete(patientId) {
  if (confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
    const { success } = await patientsStore.deletePatient(patientId);
    if (success) {
      toast.success('Paciente excluído com sucesso!');
    } else {
      toast.error('Não foi possível excluir o paciente.');
    }
  }
  actionsMenuOpenFor.value = null;
}
</script>

<template>
  <div class="patients-list-page">
    <header class="page-header">
      <div>
        <h1 class="title">Pacientes</h1>
        <p class="subtitle">Gerencie todos os pacientes da sua clínica.</p>
      </div>
      <router-link to="/app/pacientes/novo" class="btn-primary">
        <UserPlus :size="16" />
        Adicionar Paciente
      </router-link>
    </header>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nome do Paciente</th>
            <th>Telefone</th>
            <th>CPF</th>
            <th class="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="patientsStore.isLoading">
            <td colspan="4" class="state-cell">Carregando pacientes...</td>
          </tr>
          <tr v-else-if="patients.length === 0">
            <td colspan="4" class="state-cell">Nenhum paciente encontrado.</td>
          </tr>
          <tr v-for="patient in patients" :key="patient._id" class="patient-row">
            <td @click="goToPatient(patient._id)" class="clickable-cell">{{ patient.name }}</td>
            <td @click="goToPatient(patient._id)" class="clickable-cell">{{ patient.phone }}</td>
            <td @click="goToPatient(patient._id)" class="clickable-cell">{{ patient.cpf }}</td>
            <td class="actions-cell">
              <div class="actions-wrapper" v-click-outside="() => actionsMenuOpenFor = null">
                <button @click.stop="toggleActionsMenu(patient._id)" class="btn-icon">
                  <MoreHorizontal :size="20" />
                </button>
                <Transition name="fade">
                  <div v-if="actionsMenuOpenFor === patient._id" class="actions-dropdown">
                    <router-link :to="`/app/pacientes/${patient._id}?edit=true`" class="dropdown-item">
                      <Pencil :size="14"/> Editar
                    </router-link>
                    <button @click.stop="handleDelete(patient._id)" class="dropdown-item delete">
                      <Trash2 :size="14"/> Excluir
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.title { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.25rem; }
.subtitle { color: var(--cinza-texto); }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease; text-decoration: none; }
.btn-primary:hover { background-color: var(--azul-escuro); }

.table-container {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  /* overflow: hidden; -- REMOVIDO PARA O DROPDOWN FUNCIONAR */
}
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
tbody tr:last-child td { border-bottom: none; }
th { background-color: #f9fafb; color: var(--cinza-texto); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
th.actions-header { text-align: right; }
.clickable-cell { cursor: pointer; }
.patient-row:hover td {
  background-color: #f9fafb;
}
.state-cell { padding: 2rem; text-align: center; color: var(--cinza-texto); }
.actions-cell { text-align: right; }
.actions-wrapper { position: relative; display: inline-block; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--cinza-texto); }
.btn-icon:hover { background-color: #f3f4f6; }
.actions-dropdown { position: absolute; right: 0; top: calc(100% + 0.5rem); background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 10; width: 120px; padding: 0.5rem; }
.dropdown-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.5rem; width: 100%; background: none; border: none; cursor: pointer; text-decoration: none; color: #374151; font-size: 0.875rem; }
.dropdown-item:hover { background-color: #f3f4f6; }
.dropdown-item.delete:hover { background-color: #fee2e2; color: #ef4444; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
