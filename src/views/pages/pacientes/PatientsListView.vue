<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientsStore } from '@/stores/patients'
import { useToast } from 'vue-toastification'
import {
  UserPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Hash,
  User,
  Phone,
  SlidersHorizontal,
} from 'lucide-vue-next'
import AppPagination from '@/components/global/AppPagination.vue'

const patientsStore = usePatientsStore()
const router = useRouter()
const toast = useToast()

const patients = computed(() => patientsStore.patients)
const pagination = computed(() => patientsStore.pagination)
const actionsMenuOpenFor = ref(null)
const isInitialLoad = ref(true)

onMounted(async () => {
  await patientsStore.fetchPatients(1)
  isInitialLoad.value = false
})

function handlePageChange(newPage) {
  patientsStore.fetchPatients(newPage)
}

function goToPatient(patientId) {
  if (actionsMenuOpenFor.value === patientId) {
    return
  }
  router.push(`/app/pacientes/${patientId}`)
}

function toggleActionsMenu(patientId) {
  actionsMenuOpenFor.value = actionsMenuOpenFor.value === patientId ? null : patientId
}

async function handleDelete(patientId) {
  if (confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
    const { success } = await patientsStore.deletePatient(patientId)
    if (success) {
      toast.success('Paciente excluído com sucesso!')
    } else {
      toast.error('Não foi possível excluir o paciente.')
    }
  }
  actionsMenuOpenFor.value = null
}

const formatCPF = (cpf) => {
  if (!cpf) return 'N/A'
  const cpfDigits = cpf.replace(/\D/g, '')
  if (cpfDigits.length !== 11) return cpf
  return cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
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

    <div class="table-wrapper" :class="{ 'is-loading': patientsStore.isLoading && !isInitialLoad }">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="avatar-header"></th>
              <th>
                <div class="th-content">
                  <Hash :size="14" />
                  <span>CPF</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <User :size="14" />
                  <span>Nome do Paciente</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <Phone :size="14" />
                  <span>Telefone</span>
                </div>
              </th>
              <th class="actions-header">
                <div class="th-content">
                  <SlidersHorizontal :size="14" />
                  <span>Ações</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="patientsStore.isLoading && isInitialLoad">
              <td colspan="5" class="state-cell">Carregando pacientes...</td>
            </tr>
            <tr v-else-if="patients.length === 0">
              <td colspan="5" class="state-cell">Nenhum paciente encontrado.</td>
            </tr>
            <tr
              v-for="patient in patients"
              :key="patient._id"
              class="patient-row"
              @click="goToPatient(patient._id)"
            >
              <td>
                <div class="patient-avatar">{{ patient.name.charAt(0).toUpperCase() }}</div>
              </td>
              <td>{{ formatCPF(patient.cpf) }}</td>
              <td class="patient-name">{{ patient.name }}</td>
              <td>{{ patient.phone }}</td>
              <td class="actions-cell" @click.stop>
                <div class="actions-wrapper" v-click-outside="() => (actionsMenuOpenFor = null)">
                  <button @click.stop="toggleActionsMenu(patient._id)" class="btn-icon">
                    <MoreHorizontal :size="20" />
                  </button>
                  <Transition name="fade">
                    <div v-if="actionsMenuOpenFor === patient._id" class="actions-dropdown">
                      <router-link
                        :to="`/app/pacientes/${patient._id}?edit=true`"
                        class="dropdown-item"
                      >
                        <Pencil :size="14" /> Editar
                      </router-link>
                      <button @click.stop="handleDelete(patient._id)" class="dropdown-item delete">
                        <Trash2 :size="14" /> Excluir
                      </button>
                    </div>
                  </Transition>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        v-if="pagination && pagination.pages > 1"
        :current-page="pagination.page"
        :total-pages="pagination.pages"
        :total-items="pagination.total"
        :limit="pagination.limit"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.subtitle {
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
  text-decoration: none;
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}

.table-wrapper {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
}

.table-wrapper.is-loading .table-container {
  opacity: 0.5;
  pointer-events: none;
}

.table-container {
  overflow-x: auto;
  height: 70vh;
  transition: opacity 0.3s ease;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
  white-space: nowrap;
}
tbody tr:last-child td {
  border-bottom: none;
}
th {
  background-color: #f9fafb;
  color: var(--cinza-texto);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-header {
  width: 60px;
}
th.actions-header {
  width: 100px;
}
th.actions-header .th-content {
  justify-content: flex-end;
}

.patient-row {
  cursor: pointer;
}
.patient-row:hover td {
  background-color: #f9fafb;
}
.patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}
.patient-name {
  font-weight: 500;
}
.state-cell {
  padding: 2rem;
  text-align: center;
  color: var(--cinza-texto);
}
.actions-cell {
  text-align: right;
}
.actions-wrapper {
  position: relative;
  display: inline-block;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cinza-texto);
}
.btn-icon:hover {
  background-color: #f3f4f6;
}
.actions-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 120px;
  padding: 0.5rem;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: #374151;
  font-size: 0.875rem;
}
.dropdown-item:hover {
  background-color: #f3f4f6;
}
.dropdown-item.delete {
  color: #ef4444;
}
.dropdown-item.delete:hover {
  background-color: #fee2e2;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
