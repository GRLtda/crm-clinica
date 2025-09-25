<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClinicStore } from '@/stores/clinic'
import FormInput from '@/components/global/FormInput.vue'

const authStore = useAuthStore()
const clinicStore = useClinicStore()

const clinicData = ref({
  name: '',
  cnpj: '',
  address: {
    cep: '',
    city: '',
    state: '',
    street: '',
    number: '',
    district: '',
  },
})

// Preenche o formulário com os dados atuais da clínica
onMounted(() => {
  if (authStore.user?.clinic) {
    clinicData.value = { ...authStore.user.clinic }
  }
})

async function handleUpdate() {
  await clinicStore.updateClinicDetails(clinicData.value)
  // Adicionar feedback de sucesso para o usuário
  alert('Clínica atualizada com sucesso!')
}
</script>

<template>
  <div class="general-settings">
    <form @submit.prevent="handleUpdate">
      <div class="form-grid">
        <FormInput v-model="clinicData.name" label="Nome da Clínica" />
        <FormInput v-model="clinicData.cnpj" label="CNPJ" />
        <FormInput v-model="clinicData.address.cep" label="CEP" />
        <FormInput v-model="clinicData.address.street" label="Rua" />
        <FormInput v-model="clinicData.address.number" label="Número" />
        <FormInput v-model="clinicData.address.district" label="Bairro" />
        <FormInput v-model="clinicData.address.city" label="Cidade" />
        <FormInput v-model="clinicData.address.state" label="Estado" />
      </div>
      <button type="submit" class="save-button">Salvar Alterações</button>
    </form>
  </div>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.save-button {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.save-button:hover {
  background-color: var(--azul-escuro);
}
</style>
