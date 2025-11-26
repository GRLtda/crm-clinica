<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import FormInput from '@/components/global/FormInput.vue'
import PasswordInput from '@/components/global/PasswordInput.vue'
import {
  LifeBuoy,
  Zap,
  BadgeDollarSign,
  HeartHandshake,
  LogIn
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// --- ESTADO ---
const step = ref('login')
const isLoading = ref(false)
const errorMessage = ref(null)
const notificationMessage = ref(null)

// --- V-MODELS ---
const email = ref('')
const password = ref('')
const emailOrPhone = ref('')
const token = ref('')
const newPassword = ref('')

const imageUrl = new URL('@/assets/clinic1.webp', import.meta.url).href
const whatsappLink = 'https://wa.me/5511921923978'

// --- FUNÇÕES ---
function goToStep(stepName) {
  step.value = stepName
  errorMessage.value = null
  notificationMessage.value = null
  isLoading.value = false
}

async function handleLogin() {
  errorMessage.value = null
  isLoading.value = true
  const { success, user } = await authStore.login({
    email: email.value,
    password: password.value,
  })
  isLoading.value = false

  if (success) {
    const redirectPath = router.currentRoute.value.query.redirect || '/app'
    router.push(redirectPath)
  } else {
    errorMessage.value = 'Email ou senha inválidos. Verifique seus dados.'
  }
}

async function handleForgotPassword() {
  errorMessage.value = null
  notificationMessage.value = null
  isLoading.value = true
  const { success, error } = await authStore.requestPasswordReset(emailOrPhone.value)
  isLoading.value = false
  if (success) {
    notificationMessage.value = 'Código enviado! Verifique seu email ou telefone.'
    goToStep('reset')
  } else {
    errorMessage.value = error
  }
}

async function handleResetPassword() {
  errorMessage.value = null
  isLoading.value = true
  const { success, error } = await authStore.performPasswordReset({
    code: token.value,
    newPassword: newPassword.value,
  })
  isLoading.value = false
  if (success) {
    router.push('/app')
  } else {
    errorMessage.value = error
  }
}
</script>

<template>
  <AuthCard :image-url="imageUrl">

    <template #title>
      <Transition name="fade" mode="out-in">
        <div v-if="step === 'login'" key="title-login" class="header-title-wrapper">
          <div class="icon-wrapper">
            <LogIn :size="32" />
          </div>
          <div class="text-content">
            <span class="title-text">Acesse sua conta</span>
            <span class="subtitle-text">Bem-vindo de volta! Informe seus dados.</span>
          </div>
        </div>

        <span v-else-if="step === 'forgot'" key="title-forgot" class="simple-title">
          Recuperar senha
        </span>

        <span v-else-if="step === 'reset'" key="title-reset" class="simple-title">
          Redefinir senha
        </span>

        <div v-else-if="step === 'contact'" key="title-contact" class="header-title-wrapper">
          <div class="icon-wrapper">
            <LifeBuoy :size="32" />
          </div>
          <div class="text-content">
            <span class="title-text">Fale com um especialista</span>
            <span class="subtitle-text">Para melhor atendimento, cadastro via consultoria.</span>
          </div>
        </div>
      </Transition>
    </template>

    <Transition name="slide-fade" mode="out-in">

      <div v-if="step === 'login'" key="body-login">
        <form @submit.prevent="handleLogin">
          <FormInput
            v-model="email"
            label="Email"
            type="email"
            name="email"
            placeholder="seuemail@exemplo.com"
            autocomplete="email"
            :required="true"
          />
          <PasswordInput v-model="password" label="Senha" :required="true" :show-validation="false" />

          <div class="forgot-password-link">
            <a @click.prevent="goToStep('forgot')" href="#" class="link">Esqueceu a senha?</a>
          </div>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="submit" class="auth-button" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>

      <div v-else-if="step === 'forgot'" key="body-forgot">
        <p class="step-description">
          Digite seu email ou telefone e enviaremos um código de verificação para redefinir sua senha.
        </p>
        <form @submit.prevent="handleForgotPassword">
          <FormInput
            v-model="emailOrPhone"
            label="Email ou Telefone"
            name="emailOrPhone"
            placeholder="seuemail@exemplo.com"
            :required="true"
          />
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="submit" class="auth-button" :disabled="isLoading">
            {{ isLoading ? 'Enviando...' : 'Enviar código' }}
          </button>
        </form>
      </div>

      <div v-else-if="step === 'reset'" key="body-reset">
        <p class="step-description">
          Digite o código de 6 dígitos que enviamos e sua nova senha.
        </p>
        <form @submit.prevent="handleResetPassword">
          <div v-if="notificationMessage" class="notification-message">
            {{ notificationMessage }}
          </div>
          <FormInput
            v-model="token"
            label="Código de Verificação"
            name="token"
            placeholder="123456"
            :required="true"
          />
          <PasswordInput v-model="newPassword" label="Nova Senha" :required="true" />
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="submit" class="auth-button" :disabled="isLoading">
            {{ isLoading ? 'Salvando...' : 'Salvar e Entrar' }}
          </button>
        </form>
      </div>

      <div v-else-if="step === 'contact'" key="body-contact" class="contact-content">
        <hr class="divider" />
        <ul class="features-list">
          <li>
            <Zap :size="20" class="feature-icon" />
            <div class="feature-text">
              <strong>Resposta Rápida</strong>
              <p>Inicie seu projeto hoje mesmo, sem longas esperas.</p>
            </div>
          </li>
          <li>
            <BadgeDollarSign :size="20" class="feature-icon" />
            <div class="feature-text">
              <strong>Valor Acessível</strong>
              <p>Planos justos e transparentes para sua clínica decolar.</p>
            </div>
          </li>
          <li>
            <HeartHandshake :size="20" class="feature-icon" />
            <div class="feature-text">
              <strong>Suporte Humanizado</strong>
              <p>Converse diretamente com nossa equipe, sem robôs.</p>
            </div>
          </li>
        </ul>
        <a :href="whatsappLink" target="_blank" class="auth-button contact-button">
          Entrar em contato
        </a>
      </div>

    </Transition>

    <template #footer>
      <Transition name="fade" mode="out-in">
        <div v-if="step === 'login'" key="footer-login">
          Não tem uma conta?
          <a @click.prevent="goToStep('contact')" href="#" class="link">Entre em Contato</a>
        </div>

        <div v-else-if="step === 'forgot' || step === 'contact'" key="footer-back">
          Já tem uma conta?
          <a @click.prevent="goToStep('login')" href="#" class="link">Voltar ao Login</a>
        </div>

        <div v-else-if="step === 'reset'" key="footer-retry">
          Não recebeu o código?
          <a @click.prevent="goToStep('forgot')" href="#" class="link">Tentar novamente</a>
        </div>
      </Transition>
    </template>

  </AuthCard>
</template>

<style scoped>
/* --- CLASSES DE ANIMAÇÃO --- */

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* -------------------------------------- */

.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

/* Garante que o span 'simple-title' se comporte como um bloco completo quando não há icones */
.simple-title {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--preto-principal);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background-color: #eef2ff;
  color: var(--azul-principal);
  flex-shrink: 0;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--preto-principal);
}

.subtitle-text {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  font-weight: 400;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Removi a regra para o 'header-title-wrapper > span' pois não é mais necessário */
/* .header-title-wrapper > span:not(.icon-wrapper):not(.text-content) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--preto-principal);
} */

.contact-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
/* Removi o margin-top do contact-description pois agora é um subtitulo */
.contact-description {
  text-align: center;
  margin-bottom: 1.25rem;
  /* margin-top: 1.5rem; */
}
.divider {
  width: 100%;
  border: none;
  border-top: 1px solid var(--cinza-borda);
  margin-bottom: 1.25rem;
}
.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  width: 100%;
  color: var(--cinza-texto-escuro);
}
.features-list li {
  display: flex;
  align-items: flex-start;
  text-align: left;
  margin-bottom: 1rem;
}
.feature-icon {
  color: var(--azul-principal);
  margin-right: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}
.feature-text {
  display: flex;
  flex-direction: column;
}
.feature-text strong {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--preto-principal);
  line-height: 1.4;
}
.feature-text p {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  margin: 0;
  line-height: 1.5;
}
.contact-button {
  text-decoration: none;
  display: inline-block;
  padding: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0;
}
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
.auth-button:disabled {
  background-color: var(--cinza-claro);
  cursor: not-allowed;
}
.auth-button:hover:not(:disabled) {
  background-color: var(--azul-escuro);
}
.link {
  color: var(--azul-principal);
  font-weight: 600;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
```http://googleusercontent.com/image_generation_content/0
