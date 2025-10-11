<script setup>
import { ref } from 'vue'
import { useEmployeesStore } from '@/stores/employees'
import { useToast } from 'vue-toastification'
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import { Copy, Check } from 'lucide-vue-next'

const emit = defineEmits(['close'])
const employeesStore = useEmployeesStore()
const toast = useToast()

const email = ref('')
const role = ref('recepcionista')
const validationError = ref(null)
const generatedLink = ref(null)
const linkCopied = ref(false)

const roleOptions = [
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'medico', label: 'Médico(a)' },
  { value: 'gerente', label: 'Gerente' },
]

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

async function handleInvite() {
  validationError.value = null
  if (!email.value || !validateEmail(email.value)) {
    validationError.value = 'Por favor, insira um e-mail válido.'
    return
  }

  const { success, data, error } = await employeesStore.inviteEmployee({ email: email.value, role: role.value })

  if (success && data.invitation?.token) {
    // ✨ MONTA O LINK DINAMICAMENTE AQUI ✨
    const origin = window.location.origin
    generatedLink.value = `${origin}/register?invitationToken=${data.invitation.token}`
    toast.success('Convite gerado com sucesso!')
  } else {
    toast.error(error || 'Não foi possível gerar o convite.')
  }
}

function copyLink() {
  if (!generatedLink.value) return;
  navigator.clipboard.writeText(generatedLink.value).then(() => {
    linkCopied.value = true
    setTimeout(() => linkCopied.value = false, 2000)
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Convidar Novo Membro</h2>
        <p>Envie um convite para um novo funcionário se juntar à clínica.</p>
      </header>

      <div class="modal-body">
        <div v-if="!generatedLink">
          <FormInput
            v-model="email"
            label="E-mail do Convidado"
            type="email"
            placeholder="email@exemplo.com"
            :error="!!validationError"
          />
           <p v-if="validationError" class="error-message">{{ validationError }}</p>
          <StyledSelect
            v-model="role"
            :options="roleOptions"
            label="Cargo do Funcionário"
          />
        </div>
        <div v-else>
           <label class="form-label">Link de Convite Gerado</label>
           <div class="link-wrapper">
             <input type="text" :value="generatedLink" readonly class="link-input" />
             <button @click="copyLink" class="copy-button" title="Copiar link">
               <Check v-if="linkCopied" :size="16" />
               <Copy v-else :size="16"/>
             </button>
           </div>
           <p class="info">Envie este link para o e-mail do convidado. Ele é válido por 7 dias.</p>
        </div>
      </div>

      <footer class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">{{ generatedLink ? 'Fechar' : 'Cancelar' }}</button>
        <button v-if="!generatedLink" @click="handleInvite" type="button" class="btn-primary" :disabled="employeesStore.isLoading">
          {{ employeesStore.isLoading ? 'Enviando...' : 'Gerar Convite' }}
        </button>
         <button v-else @click="copyLink" type="button" class="btn-primary">Copiar Link</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Estilos do Modal (reutilizados) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(249, 250, 251, 0.7); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: var(--branco); width: 90%; max-width: 500px; border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { font-size: 1.25rem; }
.modal-header p { color: var(--cinza-texto); }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 1rem; background-color: #f9fafb; }
.btn-primary { background: var(--azul-principal); color: var(--branco); border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.btn-secondary { background: var(--branco); border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.error-message { color: #ef4444; font-size: 0.875rem; margin-top: -0.75rem; margin-bottom: 1rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
.link-wrapper { position: relative; }
.link-input { width: 100%; padding: 0.75rem 2.5rem 0.75rem 0.75rem; border-radius: 0.5rem; border: 1px solid #d1d5db; background-color: #f9fafb; font-size: 0.875rem; }
.copy-button { position: absolute; top: 50%; right: 0.5rem; transform: translateY(-50%); padding: 0.5rem; background: none; border: none; cursor: pointer; color: var(--cinza-texto); }
.info { font-size: 0.875rem; color: var(--cinza-texto); margin-top: 0.5rem; }
</style>
