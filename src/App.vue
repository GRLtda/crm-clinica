  <script setup>
  import { watch, onMounted, computed, ref } from 'vue'
  import { RouterView, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useSeoStore } from '@/stores/seo'
  import apiClient, { isGlobalOffline } from '@/api/index'
  import { WifiOff, Wifi, AlertTriangle, CheckCircle2, X } from 'lucide-vue-next'

  const authStore = useAuthStore()
  const seoStore = useSeoStore()
  const route = useRoute()

  const isRestored = ref(false)
  const isMobileExpanded = ref(false)

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

  watch(isGlobalOffline, (newVal, oldVal) => {
    if (newVal === false && oldVal === true) {
      isRestored.value = true
      isMobileExpanded.value = true
      setTimeout(() => {
        isRestored.value = false
        isMobileExpanded.value = false
      }, 3000)
    }
  })

  onMounted(async () => {
    try {
      await apiClient.get('/')
    } catch (error) {
      console.warn('⚠️ Servidor inalcançável na inicialização.')
    }
  })

  const shouldShowBanner = computed(() => {
    if (route.path === '/' || route.name === 'landing') return false
    return isGlobalOffline.value || isRestored.value
  })

  const toggleMobileExpand = () => {
    if (!isRestored.value) {
      isMobileExpanded.value = !isMobileExpanded.value
    }
  }
  </script>

  <template>
    <div class="app-layout">

      <transition name="island-pop">
        <div
          v-if="shouldShowBanner"
          class="dynamic-island"
          :class="{
            'is-online': isRestored,
            'mobile-expanded': isMobileExpanded && !isRestored,
            'mobile-fixed': true
          }"
          @click="toggleMobileExpand"
        >
          <div class="island-content">
            <div class="icon-bubble">
              <Wifi v-if="isRestored" class="w-5 h-5" stroke-width="2.5" />
              <WifiOff v-else class="w-5 h-5" stroke-width="2.5" />

              <div class="ripple-effect" v-if="!isRestored"></div>
            </div>

            <div class="info-group">
              <span class="island-title">
                {{ isRestored ? 'Conexão Restaurada' : 'Sistema Offline' }}
              </span>
              <span class="island-desc">
                {{ isRestored ? 'Você está online novamente.' : 'Toque para mais opções' }}
              </span>
            </div>
          </div>

          <div v-if="!isRestored" class="island-actions">
              <div class="island-divider"></div>
              <a href="https://wa.me/5515991136994" target="_blank" class="island-btn" @click.stop>
                <span>Reportar</span>
                <AlertTriangle size="16" />
              </a>
              <button v-if="isMobileExpanded" class="close-btn" @click.stop="toggleMobileExpand">
                <X size="16" stroke-width="3" />
              </button>
          </div>

          <div v-else class="success-check">
              <CheckCircle2 size="20" />
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
    font-family: 'Inter', sans-serif;
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

  /* 🏝️ Estilo Ilha Dinâmica (Desktop) */
  .dynamic-island {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;

    background: rgba(234, 88, 12, 0.9);
    background: linear-gradient(90deg, rgba(234, 88, 12, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%);

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    /* Usando valor fixo alto para garantir consistência na animação */
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 30px rgba(234, 88, 12, 0.2), 0 4px 10px rgba(0,0,0,0.1);

    padding: 8px 12px 8px 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    width: fit-content;
    min-width: 300px;
    max-width: 90vw;
    color: white;

    /* Animação unificada */
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: default;
    overflow: hidden; /* Importante para esconder conteúdo durante animação */
  }

  .dynamic-island.is-online {
    background: rgba(22, 163, 74, 0.9);
    background: linear-gradient(90deg, rgba(22, 163, 74, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%);
    box-shadow: 0 10px 30px rgba(22, 163, 74, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    min-width: 280px;
  }

  .island-content {
    display: flex;
    align-items: center;
    gap: 14px;
    /* Garante que o conteúdo se comporte bem */
    flex-shrink: 0;
  }

  .icon-bubble {
    background: rgba(255, 255, 255, 0.2);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
    flex-shrink: 0;
    position: relative;
  }

  .info-group {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    white-space: nowrap;
  }

  .island-title {
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .island-desc {
    font-size: 0.8rem;
    opacity: 0.95;
    font-weight: 500;
  }

  .island-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
  }

  .island-divider {
    width: 1px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.3);
  }

  .island-btn {
    background: white;
    color: #ea580c;
    text-decoration: none;
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    white-space: nowrap;
  }

  .island-btn:hover {
    transform: scale(1.05);
  }

  .success-check {
      padding-right: 8px;
      color: white;
  }

  /* ❌ Botão de Fechar Minimalista */
  .close-btn {
    background: transparent;
    border: none;
    /* Tamanho da área de clique */
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 50%;
    padding: 0;
    margin-left: 4px;
  }

  .close-btn:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .ripple-effect {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    animation: ripple-anim 2s infinite;
    pointer-events: none;
  }

  @keyframes ripple-anim {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  /* 📱 MOBILE TRANSFORMATION 📱 */
  @media (max-width: 600px) {
    .dynamic-island {
      top: auto;
      bottom: 24px;
      left: 24px;
      transform: none; /* Remove translate do desktop */

      /* 🔴 ESTADO COLAPSADO (BOLINHA) */
      width: 56px;
      height: 56px;
      min-width: 56px;
      padding: 0;

      /* Mantém border-radius fixo para evitar "wobble" na animação */
      border-radius: 50px;

      justify-content: center; /* Centraliza o conteúdo (ícone) */
      gap: 0; /* ✨ Remove espaçamento extra */

      cursor: pointer;
      box-shadow: 0 4px 20px rgba(234, 88, 12, 0.5);
    }

    /* Ajuste do container interno no mobile */
    .dynamic-island .island-content {
      gap: 0; /* ✨ Zero gap quando fechado para centralizar o ícone */
      justify-content: center;
      width: 100%;
    }

    /* ✨ ESTADO EXPANDIDO NO MOBILE */
    .dynamic-island.mobile-expanded {
      width: calc(100vw - 48px); /* Largura total menos margens */
      height: auto;
      padding: 10px 16px 10px 10px;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    }

    /* Quando expandido, devolve o gap e alinhamento */
    .dynamic-island.mobile-expanded .island-content {
      gap: 12px;
      justify-content: flex-start;
      width: auto;
    }

    /* Transições suaves para os elementos internos */
    .dynamic-island .info-group,
    .dynamic-island .island-actions,
    .dynamic-island .success-check {
      opacity: 0;
      width: 0;
      pointer-events: none;
      /* Acelera o desaparecimento para não quebrar o layout */
      transition: opacity 0.2s ease, width 0.2s ease;
    }

    .dynamic-island.mobile-expanded .info-group,
    .dynamic-island.mobile-expanded .island-actions {
      opacity: 1;
      width: auto;
      pointer-events: auto;
      /* Demora um pouco para aparecer (stagger) */
      transition: opacity 0.3s 0.1s ease, width 0.3s ease;
    }

    /* Ajustes visuais do ícone */
    .dynamic-island .icon-bubble {
      background: transparent;
      box-shadow: none;
    }

    .dynamic-island.mobile-expanded .icon-bubble {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
    }

    /* Texto */
    .dynamic-island.mobile-expanded .island-title { font-size: 0.85rem; }
    .dynamic-island.mobile-expanded .island-desc { font-size: 0.75rem; }

    /* Botões */
    .dynamic-island .island-btn span { display: none; }
    .dynamic-island.mobile-expanded .island-btn span { display: block; }

    .dynamic-island .island-btn {
      padding: 8px;
      border-radius: 50%;
    }
    .dynamic-island.mobile-expanded .island-btn {
      padding: 6px 14px;
      border-radius: 50px;
    }

    .dynamic-island .island-divider { display: none; }
    .dynamic-island.mobile-expanded .island-divider { display: block; }

    /* Controle do botão X */
    .close-btn { display: none; }
    .dynamic-island.mobile-expanded .close-btn { display: flex; }
  }

  /* Animações de entrada */
  .island-pop-enter-active,
  .island-pop-leave-active {
    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .island-pop-enter-from,
  .island-pop-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }

  @media (min-width: 601px) {
    .island-pop-enter-from,
    .island-pop-leave-to {
      transform: translate(-50%, -30px) scale(0.9);
    }
  }
  </style>
