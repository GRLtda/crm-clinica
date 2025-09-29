<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  limit: { type: Number, default: 10 },
})

const emit = defineEmits(['page-change'])

const pageNumbers = computed(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  const pages = new Set()
  pages.add(1)
  pages.add(props.totalPages)

  for (let i = -1; i <= 1; i++) {
    const page = props.currentPage + i
    if (page > 1 && page < props.totalPages) {
      pages.add(page)
    }
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sortedPages.length; i++) {
    result.push(sortedPages[i])
    if (i < sortedPages.length - 1 && sortedPages[i + 1] > sortedPages[i] + 1) {
      result.push('...')
    }
  }
  return result
})

const fromItem = computed(() => (props.currentPage - 1) * props.limit + 1)
const toItem = computed(() => Math.min(props.currentPage * props.limit, props.totalItems))
</script>

<template>
  <nav class="pagination-container" aria-label="Paginação">
    <div class="pagination-summary">
      Mostrando <strong>{{ fromItem }}</strong>-<strong>{{ toItem }}</strong> de
      <strong>{{ totalItems }}</strong> pacientes
    </div>
    <div class="pagination-controls">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn-nav"
      >
        <ChevronLeft :size="16" />
        Anterior
      </button>

      <div class="page-numbers">
        <template v-for="(page, index) in pageNumbers" :key="index">
          <button
            v-if="page !== '...'"
            @click="$emit('page-change', page)"
            :class="['btn-page', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          <span v-else class="dots">...</span>
        </template>
      </div>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn-nav"
      >
        Próxima
        <ChevronRight :size="16" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
.pagination-summary {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.btn-nav,
.btn-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: var(--branco);
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-nav {
  padding: 0.5rem 1rem;
}
.btn-page {
  width: 36px;
  height: 36px;
}
.btn-nav:hover,
.btn-page:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}
.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-page.active {
  background-color: var(--azul-principal);
  color: var(--branco);
  border-color: var(--azul-principal);
}
.dots {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--cinza-texto);
}
</style>
