<script setup>
import { computed } from 'vue'
import { Cloud, CloudCheck, CloudAlert, LoaderCircle } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String, // 'idle', 'saving', 'saved', 'error'
    default: 'idle',
  },
  lastSaved: {
    type: Date,
    default: null,
  },
})

const tooltipText = computed(() => {
  if (props.status === 'error') {
    return 'Falha ao salvar. Verifique sua conexão.'
  }
  if (props.status === 'saved' && props.lastSaved) {
    return `Salvo por último às ${props.lastSaved.toLocaleTimeString('pt-BR')}`
  }
  if (props.status === 'saving') {
    return 'Salvando alterações...'
  }
  return 'Aguardando alterações'
})
</script>

<template>
  <div class="save-status-indicator" :title="tooltipText">
    <Transition name="fade" mode="out-in">
      <div v-if="status === 'saving'" key="saving" class="status-icon saving">
        <LoaderCircle :size="18" class="animate-spin" />
        <span>Salvando...</span>
      </div>
      <div v-else-if="status === 'saved'" key="saved" class="status-icon saved">
        <CloudCheck :size="18" />
        <span>Salvo</span>
      </div>
      <div v-else-if="status === 'error'" key="error" class="status-icon error">
        <CloudAlert :size="18" />
        <span>Erro</span>
      </div>
      <div v-else key="idle" class="status-icon idle">
        <Cloud :size="18" />
        <span>Salvo</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.save-status-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}
.status-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.idle {
  color: #6b7280;
}
.saving {
  color: #6b7280;
}
.saved {
  color: #16a34a; /* verde */
}
.error {
  color: #dc2626; /* vermelho */
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
