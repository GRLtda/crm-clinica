<script setup>
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'

// Define a interface do v-model para o objeto patientData completo
const patientData = defineModel()

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
]
</script>

<template>
  <div class="step-content grid-2-cols">
    <FormInput
      v-model="patientData.name"
      label="Nome Completo"
      placeholder="Nome do paciente"
      required
    />
    <FormInput
      v-model="patientData.email"
      label="E-mail"
      placeholder="email@exemplo.com"
      type="email"
    />
    <FormInput v-model="patientData.cpf" label="CPF" placeholder="000.000.000-00" cpf-mask />
    <FormInput
      v-model="patientData.phone"
      label="Telefone"
      placeholder="(00) 00000-0000"
      required
      phone-mask
    />
    <FormInput v-model="patientData.birthDate" label="Data de Nascimento" type="date" required />
    <StyledSelect v-model="patientData.gender" label="Gênero" :options="genderOptions" required />
  </div>
</template>

<style scoped>
.step-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem 2rem;
  padding-bottom: 1.25rem;
}
@media (max-width: 768px) {
  .step-content {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
