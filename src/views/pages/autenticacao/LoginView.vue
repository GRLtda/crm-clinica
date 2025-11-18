<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import FormInput from '@/components/global/FormInput.vue'
import PasswordInput from '@/components/global/PasswordInput.vue'
// ✨ Ícones Atualizados ✨
import {
  LifeBuoy,
  Zap,
  BadgeDollarSign,
  HeartHandshake,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// --- ✨ ESTADO DE MÚLTIPLAS ETAPAS (com 'contact') ---
const step = ref('login') // 'login', 'forgot', 'reset', 'contact'
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
const whatsappLink =
  'https://wa.me/5515991136994'

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
    // Redireciona para o 'redirect' da URL ou para o dashboard
    const redirectPath = router.currentRoute.value.query.redirect || '/app'
    router.push(redirectPath)
  } else {
    errorMessage.value = 'Email ou senha inválidos. Verifique seus dados.'
  }
}

// Etapa 2: Esqueceu a senha
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

// Etapa 3: Resetar a senha
async function handleResetPassword() {
  errorMessage.value = null
  isLoading.value = true
  const { success, error } = await authStore.performPasswordReset({
    code: token.value,
    newPassword: newPassword.value,
  })
  isLoading.value = false

  if (success) {
    // API já logou o usuário, apenas redirecionamos
    router.push('/app')
  } else {
    errorMessage.value = error
  }
}
</script>

<template>
  <AuthCard :image-url="imageUrl">
    <template v-if="step === 'login'" #title>Acesse sua conta</template>
    <div v-if="step === 'login'">
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

    <template v-if="step === 'forgot'" #title>Recuperar senha</template>
    <div v-if="step === 'forgot'">
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

    <template v-if="step === 'reset'" #title>Redefinir senha</template>
    <div v-if="step === 'reset'">
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

    <template v-if="step === 'contact'" #title>
      <div class="contact-title-wrapper">
        <div class="icon-wrapper">
          <LifeBuoy :size="32" />
        </div>
        <span>Fale com um especialista</span>
      </div>
    </template>

    <div v-if="step === 'contact'" class="contact-content">
      <p class="step-description contact-description">
        Para garantir o melhor atendimento, nosso cadastro é feito através de uma
        consultoria inicial.
      </p>

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
    <template v-if="step === 'login'" #footer>
      Não tem uma conta?
      <a @click.prevent="goToStep('contact')" href="#" class="link">Entre em Contato</a>
    </template>
    <template v-if="step === 'forgot' || step === 'contact'" #footer>
      Já tem uma conta?
      <a @click.prevent="goToStep('login')" href="#" class="link">Voltar ao Login</a>
    </template>
    <template v-else-if="step === 'reset'" #footer>
      Não recebeu o código?
      <a @click.prevent="goToStep('forgot')" href="#" class="link">Tentar novamente</a>
    </template>
  </AuthCard>
</template>

<style scoped>
/* --- ESTILOS ADICIONADOS/MODIFICADOS PARA CONTATO --- */
.contact-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* ✨ Novo estilo para alinhar Título e Ícone ✨ */
.contact-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem; /* 16px de espaço entre o ícone e o texto */
  width: 100%; /* Garante que o alinhamento do AuthCard funcione */
}

/* ✨ Nova regra para diminuir o texto do título ✨ */
.contact-title-wrapper span {
  font-size: 1.5rem; /* 24px (o padrão do h2 era 1.75rem / 28px) */
  font-weight: 700; /* Mantém o peso da fonte do título */
  line-height: 1.3; /* Ajusta a altura da linha */
  color: var(--preto-principal);
}

/* Estilo do Wrapper do Ícone (margem removida) */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background-color: #eef2ff;
  color: var(--azul-principal);
  flex-shrink: 0; /* Impede que o ícone seja espremido */
}

/* Descrição da etapa de contato */
.contact-description {
  text-align: center;
  margin-bottom: 1.25rem;
  margin-top: 1.5rem; /* Adicionado espaço que o ícone ocupava */
}

/* Divisória */
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
  width: 100%; /* Ocupa toda a largura */
  color: var(--cinza-texto-escuro);
}
.features-list li {
  display: flex;
  align-items: flex-start; /* Alinha o ícone ao topo do texto */
  text-align: left;
  margin-bottom: 1rem;
}

.feature-icon {
  color: var(--azul-principal);
  margin-right: 0.75rem;
  flex-shrink: 0; /* Impede que o ícone encolha */
  margin-top: 0.125rem; /* Ajuste fino de alinhamento */
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
  padding: 0.875rem; /* Garante o mesmo padding do auth-button */
  width: 100%; /* Ocupa 100% da largura */
  box-sizing: border-box; /* Garante que o padding não estoure a largura */
  margin-top: 0; /* Remove a margem do auth-button */
}
/* -------------------------------------- */

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
