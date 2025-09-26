<script setup>
import { watch } from 'vue'
import FormInput from '@/components/global/FormInput.vue'
import { fetchAddressByCEP } from '@/api/external'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

function updateField(field, value) {
  const newAddress = { ...props.modelValue, [field]: value }
  emit('update:modelValue', newAddress)
}

watch(
  () => props.modelValue.cep,
  async (newCep) => {
    const numericCep = newCep.replace(/\D/g, '')
    if (numericCep.length === 8) {
      const address = await fetchAddressByCEP(numericCep)
      if (address) {
        emit('update:modelValue', {
          ...props.modelValue,
          street: address.street,
          district: address.neighborhood,
          city: address.city,
          state: address.state,
        })
      }
    }
  },
)
</script>

<template>
  <div class="form-section">
    <h2 class="section-title">Endereço</h2>
    <div class="form-grid">
      <FormInput
        :modelValue="modelValue.cep"
        @update:modelValue="updateField('cep', $event)"
        label="CEP"
        :mask="'#####-###'"
      />
      <FormInput
        :modelValue="modelValue.street"
        @update:modelValue="updateField('street', $event)"
        label="Rua / Logradouro"
      />
      <FormInput
        :modelValue="modelValue.number"
        @update:modelValue="updateField('number', $event)"
        label="Número"
      />
      <FormInput
        :modelValue="modelValue.district"
        @update:modelValue="updateField('district', $event)"
        label="Bairro"
      />
      <FormInput
        :modelValue="modelValue.city"
        @update:modelValue="updateField('city', $event)"
        label="Cidade"
      />
      <FormInput
        :modelValue="modelValue.state"
        @update:modelValue="updateField('state', $event)"
        label="Estado"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
}
</style>
