<script setup>
import {
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  CalendarCheck
} from 'lucide-vue-next';

const props = defineProps({
  event: { type: Object, required: true },
  position: { type: Object, required: true }, // { top: '...', left: '...' }
});
const emit = defineEmits(['close', 'status-change']);

const statuses = [
  { text: 'Confirmado', value: 'Confirmado', icon: ThumbsUp },
  { text: 'Realizado', value: 'Realizado', icon: Check },
  { text: 'Cancelado', value: 'Cancelado', icon: X },
  { text: 'Não Compareceu', value: 'Não Compareceu', icon: ThumbsDown },
];

function changeStatus(status) {
  emit('status-change', {
    appointmentId: props.event.originalEvent._id,
    newStatus: status
  });
}
</script>

<template>
  <div
    class="event-popover"
    :style="{ top: position.top, left: position.left }"
    v-click-outside="() => emit('close')"
  >
    <div class="popover-header">
      <strong>{{ event.title }}</strong>
      <span>{{ new Date(event.start).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) }}</span>
    </div>
    <ul class="status-list">
      <li v-for="status in statuses" :key="status.value">
        <button @click="changeStatus(status.value)">
          <component :is="status.icon" :size="16" />
          {{ status.text }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.event-popover {
  position: fixed;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 100;
  width: 220px;
}
.popover-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.status-list {
  list-style: none;
  padding: 0.5rem;
}
.status-list button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.status-list button:hover {
  background-color: #f3f4f6;
}
</style>
