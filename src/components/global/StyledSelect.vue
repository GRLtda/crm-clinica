<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, required: true }, // Espera um array de objetos: { value: '...', label: '...' }
});
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

// Encontra o 'label' do valor selecionado para exibição
const selectedLabel = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue);
  return selectedOption ? selectedOption.label : 'Selecione um tipo';
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option) {
  emit('update:modelValue', option.value);
  isOpen.value = false;
}
</script>

<template>
  <div class="styled-select" v-click-outside="() => isOpen = false">
    <button type="button" class="select-button" @click="toggleDropdown">
      <span>{{ selectedLabel }}</span>
      <ChevronDown :size="16" class="arrow-icon" :class="{ 'is-open': isOpen }" />
    </button>
    <Transition name="fade">
      <ul v-if="isOpen" class="options-list">
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="option-item"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.styled-select {
  position: relative;
  width: 100%;
}
.select-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--branco);
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.select-button:focus, .select-button:focus-visible {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.arrow-icon {
  color: #6b7281;
  transition: transform 0.2s ease;
}
.arrow-icon.is-open {
  transform: rotate(180deg);
}
.options-list {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  z-index: 10;
  padding: 0.5rem;
  list-style: none;
}
.option-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}
.option-item:hover {
  background-color: #f3f4f6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
