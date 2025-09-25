<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue';
import FormInput from '@/components/global/FormInput.vue';
import SuccessModal from '@/components/pages/autenticacao/SuccessModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const errorMessage = ref(null);
const registrationSuccess = ref(false);

const imageUrl = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

async function handleRegister() {
  errorMessage.value = null;
  const { success } = await authStore.register({
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
  });

  if (success) {
    registrationSuccess.value = true;
  } else {
    errorMessage.value = 'Não foi possível criar a conta. Verifique os dados.';
  }
}

function handleRegistrationComplete() {
  router.push('/onboarding/clinic');
}
</script>

<template>
  <div>
    <SuccessModal
      v-if="registrationSuccess"
      @confirm="handleRegistrationComplete"
    />

    <AuthCard :image-url="imageUrl" v-if="!registrationSuccess">
      <template #title>Crie sua conta</template>

      <form @submit.prevent="handleRegister">
        <FormInput v-model="name" label="Nome completo" placeholder="Seu nome completo" />
        <FormInput v-model="email" label="Email" type="email" placeholder="seuemail@exemplo.com" />
        <FormInput v-model="phone" label="Telefone" type="tel" placeholder="(11) 99999-9999" />
        <FormInput v-model="password" label="Senha" type="password" placeholder="Crie uma senha forte" />

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
.error-message { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; text-align: left; }
.auth-button { width: 100%; padding: 0.875rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease; margin-top: 1rem; }
.auth-button:hover { background-color: var(--azul-escuro); }
.link { color: var(--azul-principal); font-weight: 600; text-decoration: none; }
</style>
