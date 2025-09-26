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
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();
//   const isAuthenticated = authStore.isAuthenticated;
//   const hasClinic = authStore.hasClinic;

//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const isAuthPage = to.name === 'login' || to.name === 'register';

//   if (requiresAuth && !isAuthenticated) {
//     next({ name: 'login' });
//   } else if (isAuthenticated && isAuthPage) {
//     next({ name: 'inicio' });
//   } else if (isAuthenticated && !hasClinic && to.name !== 'clinic-wizard') {
//     next({ name: 'clinic-wizard' });
//   } else if (isAuthenticated && hasClinic && to.name === 'clinic-wizard') {
//     // Esta é a linha que agora vai funcionar e te protegerá
//     next({ name: 'inicio' });
//   } else {
//     next();
//   }
// });

export default router
