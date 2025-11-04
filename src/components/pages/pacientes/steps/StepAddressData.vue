<script setup>
import FormInput from '@/components/global/FormInput.vue'
// Assumimos que a lógica de busca de CEP e preenchimento está no componente pai (CreatePatientView)
// ou que o v-model (que é reativo) é suficiente.

// Define a interface do v-model para o objeto address
const addressData = defineModel()
</script>

<template>
  <div class="step-content grid-2-cols">
    <FormInput v-model="addressData.cep" label="CEP" placeholder="00000-000" />
    <FormInput
      v-model="addressData.street"
      label="Rua / Logradouro"
      placeholder="Ex: Rua das Flores"
    />
    <FormInput
      v-model="addressData.number"
      label="Número"
      placeholder="Ex: 123 ou S/N"
    />
    <FormInput
      v-model="addressData.complement"
      label="Complemento"
      placeholder="Ex: Apt 101, Fundos"
    />
    <FormInput
      v-model="addressData.district"
      label="Bairro"
      placeholder="Ex: Centro"
    />
    <FormInput
      v-model="addressData.city"
      label="Cidade"
      placeholder="Ex: São Paulo"
    />
    <FormInput
      v-model="addressData.state"
      label="Estado"
      placeholder="Ex: SP"
    />
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
