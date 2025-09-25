import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dashboardRoutes from './dashboard'

// Views Públicas e de Autenticação
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/pages/autenticacao/LoginView.vue'
import RegisterView from '../views/pages/autenticacao/RegisterView.vue'
import ClinicWizardView from '../views/pages/onboarding/ClinicWizardView.vue'

const routes = [
  { path: '/', name: 'landing', component: LandingView, meta: { public: true } },
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { public: true } },
  {
    path: '/onboarding/clinic',
    name: 'clinic-wizard',
    component: ClinicWizardView,
    meta: { requiresAuth: true },
  },
  ...dashboardRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- GUARDA DE NAVEGAÇÃO GLOBAL ATUALIZADO ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const hasClinic = authStore.hasClinic // Usando nosso novo getter

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthPage = to.name === 'login' || to.name === 'register'

  if (requiresAuth && !isAuthenticated) {
    // 1. Se a rota é protegida e o usuário não está logado, vai para o login.
    next({ name: 'login' })
  } else if (isAuthenticated && isAuthPage) {
    // 2. Se o usuário está logado e tenta acessar login/registro, vai para o dashboard.
    next({ name: 'inicio' })
  } else if (isAuthenticated && !hasClinic && to.name !== 'clinic-wizard') {
    // 3. Se está logado, NÃO tem clínica e NÃO está indo para o wizard, FORÇA o redirecionamento para o wizard.
    next({ name: 'clinic-wizard' })
  } else if (isAuthenticated && hasClinic && to.name === 'clinic-wizard') {
    // 4. Se está logado, JÁ TEM clínica e tenta acessar o wizard, vai para o dashboard para não ficar preso.
    next({ name: 'inicio' })
  } else {
    // 5. Em todos os outros casos, permite a navegação.
    next()
  }
})

export default router
