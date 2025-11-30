<script setup>
import { useLayoutStore } from '@/stores/layout'
import SubscribeButton from '@/components/SubscribeButton.vue'
import { Crown, CheckCircle2 } from 'lucide-vue-next'

const layoutStore = useLayoutStore()
</script>

<template>
  <div v-if="layoutStore.isSubscriptionModalOpen" class="premium-overlay">
    <div class="premium-content">
      <div class="icon-wrapper">
        <div class="icon-bg">
          <Crown class="icon-crown" :size="48" />
        </div>
      </div>
      
      <div class="text-center">
        <h2 class="title">Desbloqueie o Premium</h2>
        <p class="subtitle">
          Esta funcionalidade é exclusiva para assinantes. <br>
          Eleve sua clínica ao próximo nível.
        </p>
      </div>

      <div class="benefits-container">
        <div class="benefit-item">
          <CheckCircle2 class="check-icon" :size="20" />
          <span>Acesso ilimitado a todas as funcionalidades</span>
        </div>
        <div class="benefit-item">
          <CheckCircle2 class="check-icon" :size="20" />
          <span>Suporte prioritário 24/7</span>
        </div>
        <div class="benefit-item">
          <CheckCircle2 class="check-icon" :size="20" />
          <span>Relatórios e análises avançadas</span>
        </div>
        <div class="benefit-item">
          <CheckCircle2 class="check-icon" :size="20" />
          <span>Gestão multi-unidades</span>
        </div>
      </div>

      <div class="action-area">
        <SubscribeButton class="w-full premium-btn" />
        <p class="guarantee-text">Cancele a qualquer momento.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.premium-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.4s ease-out;
}

.premium-content {
  background: white;
  width: 100%;
  max-width: 480px;
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.05), 
    0 8px 10px -6px rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.icon-bg {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.icon-crown {
  color: #2563eb;
}

.text-center {
  text-align: center;
}

.title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: #6b7280;
  font-size: 1.125rem;
  line-height: 1.6;
}

.benefits-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-weight: 500;
}

.check-icon {
  color: #10b981;
  flex-shrink: 0;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.guarantee-text {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .premium-content {
    width: 90%;
    padding: 2rem 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
}

.w-full {
  width: 100%;
}

.premium-btn {
  font-size: 1.125rem;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}
</style>
