import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { clickOutside } from './directives/click-outside'
import { phoneMask } from './directives/phone-mask'
import { cpfMask } from './directives/cpf-mask'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

import App from './App.vue'
import router from './router'

// Estilos
import './assets/css/normalize.css'
import './assets/css/global.css'
import './assets/css/custom-toast.css' // 👈 1. Importe o novo arquivo de estilo

const app = createApp(App)

// --- DIRETIVAS ---
app.directive('click-outside', clickOutside)
app.directive('phone-mask', phoneMask)
app.directive('cpf-mask', cpfMask)

// 👇 2. Atualize as opções do Toast
const toastOptions = {
  position: 'bottom-right', // Posição alterada
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true, // Esconde a barra de progresso padrão
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__fade', // Transição mais sutil
  maxToasts: 4,
  newestOnTop: true,
}

app.use(Toast, toastOptions)

app.use(autoAnimatePlugin)
app.use(createPinia())


const authStore = useAuthStore()
authStore.checkAuth()

app.use(router)
app.mount('#app')
