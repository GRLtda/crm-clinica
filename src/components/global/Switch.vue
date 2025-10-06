<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

function toggle(event) {
  emit('update:modelValue', event.target.checked);
}
</script>

<template>
  <label class="switch-container" :class="{ 'is-disabled': disabled }">
    <div class="switch-wrapper">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="toggle"
        :disabled="disabled"
        class="switch-input"
      />
      <span class="switch-toggle"></span>
    </div>
    <span v-if="label" class="switch-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch-container {
  display: flex;
  align-items: flex-start; /* ✨ ALTERADO: Alinha pelo topo para corrigir o problema com texto de múltiplas linhas */
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}
.switch-container.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.switch-wrapper {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
  flex-shrink: 0; /* ✨ ADICIONADO: Garante que o switch não encolha */
}
.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}
.switch-toggle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s ease-in-out;
}
.switch-toggle::before {
  content: '';
  position: absolute;
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.switch-input:checked + .switch-toggle {
  background-color: var(--azul-principal);
}
.switch-input:checked + .switch-toggle::before {
  transform: translateX(24px);
}
.switch-label {
  font-size: 0.875rem;
  color: #374151;
  /* ✨ ADICIONADO: Leve ajuste para alinhar melhor a primeira linha de texto com o centro do switch */
  padding-top: 5px;
}
</style>
