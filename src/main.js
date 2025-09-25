import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { clickOutside } from './directives/click-outside'

import App from './App.vue'
import router from './router'

import './css/normalize.css'
import './css/global.css'

const app = createApp(App)
const pinia = createPinia()
app.directive('click-outside', clickOutside) // 2. Registre a diretiva
app.use(pinia)
const authStore = useAuthStore()
authStore.checkAuth()

app.use(router)
app.mount('#app')
