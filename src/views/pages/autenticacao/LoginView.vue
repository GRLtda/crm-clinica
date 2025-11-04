<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import FormInput from '@/components/global/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref(null)

const imageUrl = new URL('@/assets/clinic1.webp', import.meta.url).href

async function handleLogin() {
  errorMessage.value = null
  const { success, user } = await authStore.login({
    email: email.value,
    password: password.value,
  })

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
</script>

<template>
  <AuthCard :image-url="imageUrl">
    <template #title>Bem-vindo de volta!</template>

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
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button type="submit" class="auth-button">Entrar</button>
    </form>

    <template #footer>
      Não tem uma conta? <router-link to="/register" class="link">Cadastre-se</router-link>
    </template>
  </AuthCard>
</template>

<style scoped>
/* Estilos permanecem os mesmos, mas agora aplicados em um contexto diferente */
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
