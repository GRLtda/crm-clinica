<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEmployeesStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { UserPlus, MoreHorizontal, Pencil, Trash2, UserCog, UserCheck, Clock, Mail, Users } from 'lucide-vue-next'
import InviteEmployeeModal from '../modals/InviteEmployeeModal.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'

const employeesStore = useEmployeesStore()
const authStore = useAuthStore()
const toast = useToast()

const isModalOpen = ref(false)
const actionsMenuOpenFor = ref(null)
const editingRoleFor = ref(null)
const selectedRole = ref('')

const currentUser = computed(() => authStore.user)

onMounted(() => {
  employeesStore.fetchEmployees()
})

const roleOptions = [
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'medico', label: 'Médico(a)' },
  { value: 'gerente', label: 'Gerente' },
]

function getRoleLabel(roleValue) {
  if (roleValue === 'owner') return 'Proprietário'
  const role = roleOptions.find(r => r.value === roleValue)
  return role ? role.label : 'N/D'
}

function openEditRole(employee) {
  actionsMenuOpenFor.value = null
  selectedRole.value = employee.role
  editingRoleFor.value = employee._id
}

async function handleUpdateRole(employeeId) {
  const { success } = await employeesStore.updateEmployeeRole(employeeId, selectedRole.value)
  if (success) {
    toast.success('Cargo atualizado com sucesso!')
  } else {
    toast.error('Erro ao atualizar cargo.')
  }
  editingRoleFor.value = null
}

async function handleDelete(employeeId) {
  actionsMenuOpenFor.value = null
  if (confirm('Tem certeza que deseja demitir este funcionário? Esta ação não pode ser desfeita.')) {
    const { success } = await employeesStore.deactivateEmployee(employeeId)
    if (success) {
      toast.success('Funcionário desativado com sucesso!')
    } else {
      toast.error('Não foi possível desativar o funcionário.')
    }
  }
}

function isOwner(employee) {
  return employee.role === 'owner'
}
</script>

<template>
  <div>
    <InviteEmployeeModal v-if="isModalOpen" @close="isModalOpen = false" />

    <div class="header-actions">
      <div>
        <h2>Membros da Equipe</h2>
        <p class="header-subtitle">Gerencie os acessos e funções dos funcionários.</p>
      </div>
      <button v-if="currentUser?.role === 'owner' || currentUser?.role === 'gerente'" @click="isModalOpen = true" class="btn-primary">
        <UserPlus :size="16" />
        Convidar Funcionário
      </button>
    </div>

    <div class="section-container">
      <h3 class="section-title"><UserCheck :size="20" /> Equipe Ativa</h3>
      <div v-if="employeesStore.isLoading" class="state-cell">Carregando...</div>
      <ul v-else-if="employeesStore.activeEmployees.length > 0" class="item-list">
        <li v-for="employee in employeesStore.activeEmployees" :key="employee._id" class="list-item">
          <div class="item-main-info">
            <div class="item-avatar">{{ employee.name.charAt(0) }}</div>
            <div class="item-details">
              <span class="item-name">{{ employee.name }}</span>
              <span class="item-email">{{ employee.email }}</span>
            </div>
          </div>
          <div class="item-role">
            <div v-if="editingRoleFor === employee._id" class="role-select-wrapper">
               <StyledSelect
                  v-model="selectedRole"
                  :options="roleOptions"
                  @update:modelValue="handleUpdateRole(employee._id)"
                  @blur="editingRoleFor = null"
                />
            </div>
            <span v-else class="role-badge" :class="`role--${employee.role}`">{{ getRoleLabel(employee.role) }}</span>
          </div>
          <div class="item-actions" @click.stop>
            <div v-if="!isOwner(employee) && (currentUser?.role === 'owner' || currentUser?.role === 'gerente')" class="actions-wrapper" v-click-outside="() => (actionsMenuOpenFor = null)">
              <button @click.stop="actionsMenuOpenFor = employee._id" class="btn-icon">
                <MoreHorizontal :size="20" />
              </button>
              <Transition name="fade">
                <div v-if="actionsMenuOpenFor === employee._id" class="actions-dropdown">
                  <button @click="openEditRole(employee)" class="dropdown-item"><UserCog :size="14" /> Alterar Cargo</button>
                  <button @click="handleDelete(employee._id)" class="dropdown-item delete"><Trash2 :size="14" /> Demitir</button>
                </div>
              </Transition>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="empty-state">
        <div class="icon-wrapper"><Users :size="48" /></div>
        <h3 class="empty-title">Sua equipe começa aqui</h3>
        <p class="empty-description">Você ainda não possui funcionários cadastrados. Comece convidando o primeiro membro.</p>
        <button @click="isModalOpen = true" class="create-button">
          <UserPlus :size="16" />
          Convidar Funcionário
        </button>
      </div>
    </div>

    <div class="section-container">
      <h3 class="section-title"><Clock :size="20" /> Convites Pendentes</h3>
       <div v-if="employeesStore.isLoading" class="state-cell">Carregando...</div>
      <ul v-else-if="employeesStore.pendingInvitations.length > 0" class="item-list">
        <li v-for="invite in employeesStore.pendingInvitations" :key="invite._id" class="list-item is-pending">
          <div class="item-main-info">
             <div class="item-avatar-placeholder"><Mail :size="20"/></div>
             <div class="item-details">
               <span class="item-email only-email">{{ invite.email }}</span>
             </div>
          </div>
          <div class="item-role">
            <span class="role-badge" :class="`role--${invite.role}`">{{ getRoleLabel(invite.role) }}</span>
          </div>
          <div class="item-actions">
             <span class="pending-text">Aguardando aceite</span>
          </div>
        </li>
      </ul>
      <div v-else class="empty-list-card">Nenhum convite pendente no momento.</div>
    </div>
  </div>
</template>

<style scoped>
/* Cabeçalho */
.header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.header-subtitle { margin-top: 0.25rem; color: var(--cinza-texto); }
.btn-primary, .create-button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color .3s ease; }
.btn-primary:hover, .create-button:hover { background-color: var(--azul-escuro); }

/* Seções */
.section-container { margin-bottom: 2.5rem; }
.section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--preto); }
.state-cell, .empty-list-card { padding: 2rem; text-align: center; color: var(--cinza-texto); background-color: #f9fafb; border-radius: 0.75rem; border: 1px solid #e5e7eb; }

/* Lista de Itens */
.item-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.list-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 0.75rem; }
.item-main-info { flex-grow: 1; display: flex; align-items: center; gap: 1rem; min-width: 0; }
.item-avatar { width: 40px; height: 40px; border-radius: 50%; background-color: #eef2ff; color: var(--azul-principal); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; flex-shrink: 0; }
.item-details { display: flex; flex-direction: column; min-width: 0; }
.item-name { font-weight: 600; }
.item-email { color: var(--cinza-texto); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-email.only-email { color: #374151; font-weight: 500; font-size: 1rem; }
.item-role { width: 150px; text-align: center; flex-shrink: 0; }
.role-select-wrapper { max-width: 150px; }
.role-badge { font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; text-transform: capitalize; }
.role--medico { background-color: #e0f2fe; color: #0ea5e9; }
.role--recepcionista { background-color: #fefce8; color: #a16207; }
.role--gerente { background-color: #f0fdf4; color: #16a34a; }
.role--owner { background-color: #dd9b17; color: #ffffff; }
.item-actions { width: 150px; display: flex; justify-content: flex-end; flex-shrink: 0; }

/* Convites Pendentes */
.list-item.is-pending { background-color: #f9fafb; }
.item-avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background-color: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pending-text { font-size: 0.8rem; color: var(--cinza-texto); font-style: italic; white-space: nowrap; }

/* Ações Dropdown */
.actions-wrapper { position: relative; }
.actions-dropdown { position: absolute; right: 0; top: calc(100% + 0.5rem); background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 10; width: 160px; padding: 0.5rem; }
.dropdown-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; border-radius: 0.5rem; width: 100%; background: none; border: none; cursor: pointer; color: #374151; font-size: 0.875rem; font-weight: 500; }
.dropdown-item:hover { background-color: #f3f4f6; }
.dropdown-item.delete { color: #ef4444; }
.dropdown-item.delete:hover { background-color: #fee2e2; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--cinza-texto); }
.btn-icon:hover { background-color: #f3f4f6; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }

/* Novo Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; border: 2px dashed #d1d5db; border-radius: 1rem; background-color: rgba(239, 246, 255, 0.5); text-align: center; }
.icon-wrapper { color: var(--azul-principal); margin-bottom: 1.5rem; }
.empty-title { font-family: var(--fonte-titulo); font-size: 1.25rem; font-weight: 600; color: var(--preto); margin-bottom: 0.5rem; }
.empty-description { max-width: 400px; color: var(--cinza-texto); margin-bottom: 2rem; line-height: 1.6; }


/* Responsividade */
/* Responsividade */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  .list-item {
    display: grid;
    grid-template-columns: 1fr auto; /* Coluna flexível para info, coluna automática para ações */
    grid-template-rows: auto auto;
    gap: 0.75rem 1rem;
    padding: 1rem;
    align-items: center;
  }
  .item-main-info {
    grid-column: 1 / -1; /* Ocupa a primeira linha inteira */
  }
  .item-role {
    grid-column: 1; /* Ocupa a primeira coluna da segunda linha */
    width: auto;
    text-align: left;
  }
  .item-actions {
    grid-column: 2; /* Ocupa a segunda coluna da segunda linha */
    width: auto;
    justify-content: flex-end;
  }
  .pending-text {
    /* Ajusta o texto de status para se alinhar corretamente na grid */
    font-size: 0.875rem;
    text-align: right;
  }
  .section-title {
    font-size: 1.125rem;
  }
}
</style>
