import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { clickOutside } from './directives/click-outside'
import { phoneMask } from './directives/phone-mask' // 1. Importa nossa diretiva

import App from './App.vue'
import router from './router'

// Estilos
import './css/normalize.css'
import './css/global.css'

const app = createApp(App)

// --- DIRETIVAS ---
app.directive('click-outside', clickOutside)
app.directive('phone-mask', phoneMask) // 2. Registra a nova diretiva

app.use(createPinia())

const authStore = useAuthStore()
authStore.checkAuth()

app.use(router)
app.mount('#app')
