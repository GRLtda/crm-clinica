<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getInvitationDetails } from '@/api/employees'
import { useToast } from 'vue-toastification'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import FormInput from '@/components/global/FormInput.vue'
import PasswordInput from '@/components/global/PasswordInput.vue'
import { CheckCircle2 } from 'lucide-vue-next'
import confetti from 'canvas-confetti'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const errorMessage = ref(null)
const registrationSuccess = ref(false)

// Estado para o fluxo de convite
const isInvitation = ref(false)
const invitationToken = ref(null)

const imageUrl =
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

// Busca os dados do convite ao carregar a página
onMounted(async () => {
  const token = route.query.invitationToken
  if (token) {
    invitationToken.value = token
    try {
      const response = await getInvitationDetails(token)
      if (response.data) {
        email.value = response.data.email
        isInvitation.value = true
        toast.info(`Bem-vindo(a)! Complete seu cadastro para a clínica.`)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do convite:', error)
      toast.error('Seu link de convite é inválido ou já expirou!')
      router.push('/register') // Limpa a URL
    }
  }
})

watch(registrationSuccess, (newValue) => {
  if (newValue) {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    })
  }
})

async function handleRegister() {
  errorMessage.value = null

  const payload = {
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
  }

  if (invitationToken.value) {
    payload.invitationToken = invitationToken.value
  }

  const { success } = await authStore.register(payload)

  if (success) {
    registrationSuccess.value = true
  } else {
    errorMessage.value = authStore.error || 'Não foi possível criar a conta. Verifique os dados.'
  }
}

function handleRegistrationComplete() {
  if (isInvitation.value) {
    router.push('/app')
  } else {
    router.push('/onboarding/clinic')
  }
}
</script>

<template>
  <div>
    <div v-if="registrationSuccess" class="success-screen">
      <div class="success-content">
        <CheckCircle2 class="success-icon" :size="64" />
        <h1 class="title">Eba! Conta criada!</h1>
        <p class="message">Seja bem-vindo(a)! Estamos felizes em ter você conosco.</p>
        <button @click="handleRegistrationComplete" class="confirm-button">Continuar</button>
      </div>
    </div>

    <AuthCard :image-url="imageUrl" v-if="!registrationSuccess">
      <template #title>Crie sua conta</template>

      <form @submit.prevent="handleRegister">
        <FormInput
          v-model="name"
          label="Nome completo"
          name="name"
          placeholder="Seu nome completo"
          autocomplete="name"
          required="true"
        />
        <FormInput
          v-model="email"
          label="Email"
          type="email"
          name="email"
          placeholder="seuemail@exemplo.com"
          autocomplete="email"
          required="true"
          :disabled="isInvitation"
        />
        <FormInput
          v-model="phone"
          label="Telefone"
          type="tel"
          name="tel"
          placeholder="(11) 99999-9999"
          autocomplete="tel"
          phone-mask
          required="true"
        />
        <PasswordInput v-model="password" label="Senha" required="true" />

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="auth-button">Criar conta</button>
      </form>

      <template #footer>
        Já tem uma conta? <router-link to="/login" class="link">Entre</router-link>
      </template>
    </AuthCard>
  </div>
</template>

<style scoped>
/* Estilos da tela de sucesso (sem alterações) */
.success-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--branco);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fade-in 0.5s ease-out;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.success-content {
  text-align: center;
  padding: 0 1.5rem;
}
.success-icon {
  color: #10b981;
  margin-bottom: 1.5rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.message {
  color: var(--cinza-texto);
  margin-bottom: 2rem;
  font-size: 1.125rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}
.confirm-button {
  max-width: 300px;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.confirm-button:hover {
  background-color: var(--azul-escuro);
}

/* Estilos do formulário (sem alterações) */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;
}
.auth-button {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
}
.auth-button:hover {
  background-color: var(--azul-escuro);
}
.link {
  color: var(--azul-principal);
  font-weight: 600;
  text-decoration: none;
}
</style>
