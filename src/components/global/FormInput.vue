<script setup>
defineProps({
  modelValue: String,
  label: String,
  name: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  autocomplete: String,
  phoneMask: { type: Boolean, default: false },
  cpfMask: { type: Boolean, default: false },
  cnpjMask: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <input
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :value="modelValue"
      :autocomplete="autocomplete"
      @input="handleInput"
      v-phone-mask="phoneMask"
      v-cpf-mask="cpfMask"
      v-cnpj-mask="cnpjMask"
      class="form-input"
    />
  </div>
</template>

<style scoped>
.form-group {
  text-align: left;
  margin-bottom: 1.25rem;
}

/* ✨ Estilos do label atualizados aqui 👇 */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;

  /* Impede a quebra de linha */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%; /* Garante que o overflow seja calculado corretamente */
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: var(--branco);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}
</style>
