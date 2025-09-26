import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { clickOutside } from './directives/click-outside'
import { phoneMask } from './directives/phone-mask'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'

// Estilos
import './css/normalize.css'
import './css/global.css'

const app = createApp(App)

// --- DIRETIVAS ---
app.directive('click-outside', clickOutside)
app.directive('phone-mask', phoneMask)
const toastOptions = {
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
};

app.use(Toast, toastOptions);

app.use(createPinia())

const authStore = useAuthStore()
authStore.checkAuth()

app.use(router)
app.mount('#app')
