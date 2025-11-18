<script setup>
import { watch, onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSeoStore } from '@/stores/seo'
import apiClient, { isGlobalOffline } from '@/api/index'
import { WifiOff, AlertTriangle } from 'lucide-vue-next'

const authStore = useAuthStore()
const seoStore = useSeoStore()
const route = useRoute()

watch(
  () => authStore.user?.clinic,
  (newClinic) => {
    if (newClinic && newClinic.themeColor) {
      seoStore.setThemeColor(newClinic.themeColor)
    } else {
      seoStore.setThemeColor('#FFFFFF')
    }
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    await apiClient.get('/')
  } catch (error) {
    console.warn('⚠️ Servidor inalcançável na inicialização.')
  }
})

// 🧠 Lógica Inteligente para exibir a tarja
const shouldShowBanner = computed(() => {
  // 1. Se o sistema NÃO estiver offline, esconde.
  if (!isGlobalOffline.value) return false

  // 2. Se estiver na Landing Page (rota '/' ou nome 'landing'), esconde.
  if (route.path === '/' || route.name === 'landing') return false

  // 3. Caso contrário, mostra a tarja.
  return true
})
</script>

<template>
  <div class="app-layout">

    <transition name="slide-down">
      <div v-if="shouldShowBanner" class="offline-banner">
        <div class="banner-container">
          <div class="banner-info">
            <div class="icon-box">
              <WifiOff class="w-5 h-5" />
            </div>
            <div class="text-content">
              <h3 class="banner-title">Sistema Indisponível</h3>
              <p class="banner-desc">Não foi possível conectar ao servidor. Verifique sua conexão.</p>
            </div>
          </div>

          <div class="banner-actions">
            <a href="https://wa.me/5515991136994" target="_blank" class="report-btn">
              <span class="btn-icon"><AlertTriangle size="16"/></span>
              Reportar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </transition>

    <div class="main-content">
      <RouterView />
    </div>

  </div>
</template>

<style>
/* Reset básico */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.app-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.main-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 🎨 Estilo da Tarja Flutuante (Overlay) com Transparência */
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99999;

  /* ✨ Background transparente com blur (Efeito Vidro) */
  background-color: rgba(234, 88, 12, 0.9); /* Levemente mais opaco para legibilidade */
  backdrop-filter: blur(10px);

  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.banner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1; /* Ocupa espaço disponível */
}

.icon-box {
  background: rgba(255, 255, 255, 0.15);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.text-content {
  display: flex;
  flex-direction: column;
}

.banner-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.banner-desc {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.4;
}

.report-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

.report-btn:hover {
  background: white;
  color: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 📱 Responsividade Otimizada */
@media (max-width: 768px) {
  .banner-container {
    flex-direction: column; /* Empilha o conteúdo verticalmente */
    align-items: stretch;   /* Estica para ocupar a largura total */
    padding: 1rem;          /* Mais espaço nas bordas */
    gap: 0.75rem;           /* Espaço menor entre texto e botão */
  }

  .banner-info {
    flex-direction: row;    /* Mantém ícone ao lado do texto para economizar altura */
    align-items: flex-start; /* Alinha no topo caso o texto quebre linha */
    text-align: left;
    width: 100%;
  }

  .text-content {
    padding-top: 2px; /* Ajuste fino para alinhar com ícone */
  }

  .banner-actions {
    width: 100%;
  }

  .report-btn {
    justify-content: center; /* Centraliza o texto do botão */
    width: 100%;             /* Botão ocupa toda a largura */
    padding: 0.75rem;        /* Área de toque maior */
  }
}

/* ✨ Animação de Entrada */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

