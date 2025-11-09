<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import FormInput from '@/components/global/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

// --- ✨ ESTADO DE MÚLTIPLAS ETAPAS ---
const step = ref('login') // 'login', 'forgot', 'reset'
const isLoading = ref(false)
const errorMessage = ref(null)
const notificationMessage = ref(null) // Para mensagens de sucesso/info

// --- V-MODELS ---
// Etapa 'login'
const email = ref('')
const password = ref('')
// Etapa 'forgot'
const emailOrPhone = ref('')
// Etapa 'reset'
const token = ref('')
const newPassword = ref('')

const imageUrl = new URL('@/assets/clinic1.webp', import.meta.url).href

// --- FUNÇÕES DE NAVEGAÇÃO DE ETAPA ---
function goToStep(stepName) {
  step.value = stepName
  errorMessage.value = null
  notificationMessage.value = null
  isLoading.value = false
}

// --- HANDLERS DE FORMULÁRIO ---

// Etapa 1: Login
async function handleLogin() {
  errorMessage.value = null
  isLoading.value = true
  const { success, user } = await authStore.login({
    email: email.value,
    password: password.value,
  })
  isLoading.value = false

  if (success) {
    if (user && user.clinic) {
      router.push('/app')
    } else {
      router.push('/onboarding/clinic')
    }
  } else {
    errorMessage.value = 'Email ou senha inválidos. Tente novamente.'
  }
}

// Etapa 2: Solicitar Código
async function handleForgotPassword() {
  errorMessage.value = null
  notificationMessage.value = null
  isLoading.value = true

  const { success, message, error } = await authStore.requestPasswordReset(emailOrPhone.value)
  isLoading.value = false

  if (success) {
    // A API sempre retorna sucesso (por segurança), então mostramos a msg da API.
    notificationMessage.value = message // "Se um usuário for encontrado..."
    step.value = 'reset' // Avança para a etapa de inserir o código
  } else {
    // Ex: Erro de Rate Limit (429)
    errorMessage.value = error
  }
}

// Etapa 3: Redefinir Senha
async function handleResetPassword() {
  errorMessage.value = null
  notificationMessage.value = null
  isLoading.value = true

  const { success, user, error } = await authStore.performPasswordReset({
    token: token.value,
    newPassword: newPassword.value,
  })
  isLoading.value = false

  if (success) {
    // Logado com sucesso! Redireciona com base na clínica.
    if (user && user.clinic) {
      router.push('/app')
    } else {
      router.push('/onboarding/clinic')
    }
  } else {
    // Ex: Código inválido
    errorMessage.value = error
  }
}
</script>

<template>
  <AuthCard :image-url="imageUrl">
    <div v-if="notificationMessage" class="notification-message">
      {{ notificationMessage }}
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <template v-if="step === 'login'" #title>Bem-vindo de volta!</template>
    <template v-else-if="step === 'forgot'" #title>Redefinir Senha</template>
    <template v-else-if="step === 'reset'" #title>Verifique seu WhatsApp</template>

    <div v-if="step === 'login'">
      <form @submit.prevent="handleLogin">
        <FormInput
          v-model="email"
          label="Email"
          type="email"
          name="email"
          placeholder="seuemail@exemplo.com"
          autocomplete="email"
          required="true"
        />
        <FormInput
          v-model="password"
          label="Senha"
          type="password"
          name="password"
          placeholder="Sua senha"
          autocomplete="current-password"
          required="true"
        />
        <div class="forgot-password-link">
          <a @click.prevent="goToStep('forgot')" href="#" class="link">Esqueci minha senha</a>
        </div>
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>

    <div v-else-if="step === 'forgot'">
      <p class="step-description">
        Digite seu email ou telefone cadastrado. Se encontrarmos sua conta, enviaremos um código de
        6 dígitos para o seu WhatsApp.
      </p>
      <form @submit.prevent="handleForgotPassword">
        <FormInput
          v-model="emailOrPhone"
          label="Email ou Telefone"
          type="text"
          name="emailOrPhone"
          placeholder="seuemail@exemplo.com"
          autocomplete="email"
          required="true"
        />
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar Código' }}
        </button>
      </form>
    </div>

    <div v-else-if="step === 'reset'">
      <p class="step-description">
        Enviamos um código de 6 dígitos. Insira-o abaixo junto com sua nova senha.
      </p>
      <form @submit.prevent="handleResetPassword">
        <FormInput
          v-model="token"
          label="Código de 6 dígitos"
          type="text"
          name="token"
          placeholder="123456"
          autocomplete="one-time-token"
          required="true"
          maxlength="6"
        />
        <FormInput
          v-model="newPassword"
          label="Nova Senha"
          type="password"
          name="newPassword"
          placeholder="Sua nova senha forte"
          autocomplete="new-password"
          required="true"
        />
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Redefinindo...' : 'Redefinir Senha e Entrar' }}
        </button>
      </form>
    </div>

    <template v-if="step === 'login'" #footer>
      Não tem uma conta? <router-link to="/register" class="link">Cadastre-se</router-link>
    </template>
    <template v-else-if="step === 'forgot'" #footer>
      Lembrou a senha? <a @click.prevent="goToStep('login')" href="#" class="link">Voltar ao Login</a>
    </template>
    <template v-else-if="step === 'reset'" #footer>
      Não recebeu?
      <a @click.prevent="goToStep('forgot')" href="#" class="link">Tentar novamente</a>
    </template>

    </AuthCard>
</template>

<style scoped>
/* --- ✨ NOVOS ESTILOS ADICIONADOS --- */
.step-description {
  font-size: 0.95rem;
  color: var(--cinza-texto);
  margin-bottom: 1.5rem;
  text-align: left;
  line-height: 1.5;
}

.notification-message {
  color: var(--azul-principal);
  background-color: var(--azul-claro);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--azul-borda);
}

.forgot-password-link {
  text-align: right;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
/* ---------------------------------- */

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
.auth-button:disabled {
  background-color: var(--cinza-claro);
  cursor: not-allowed;
}
.link {
  color: var(--azul-principal);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
</style>
