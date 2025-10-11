import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dashboardRoutes from './dashboard'
import { nextTick } from 'vue'

// Views Públicas e de Autenticação
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/pages/autenticacao/LoginView.vue'
import RegisterView from '../views/pages/autenticacao/RegisterView.vue'
import ClinicWizardView from '../views/pages/onboarding/ClinicWizardView.vue'
import AnswerAnamnesisView from '../views/public/AnswerAnamnesisView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'landing', component: LandingView, meta: { public: true, title: 'Bem-vindo' } },
  { path: '/login', name: 'login', component: LoginView, meta: { public: true, title: 'Login' } },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { public: true, title: 'Cadastro' },
  },
  {
    path: '/onboarding/clinic',
    name: 'clinic-wizard',
    component: ClinicWizardView,
    meta: { requiresAuth: true, title: 'Configuração da Clínica' },
  },
  {
    path: '/anamnese/:token',
    name: 'answer-anamnesis',
    component: AnswerAnamnesisView,
    meta: { public: true, title: 'Responder Anamnese' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Página não encontrada' },
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
  const hasClinic = authStore.hasClinic

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthPage = to.name === 'login' || to.name === 'register'

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (isAuthenticated && isAuthPage) {
    next({ name: 'inicio' })
  } else if (isAuthenticated && !hasClinic && to.name !== 'clinic-wizard') {
    next({ name: 'clinic-wizard' })
  } else if (isAuthenticated && hasClinic && to.name === 'clinic-wizard') {
    // Esta é a linha que agora vai funcionar e te protegerá
    next({ name: 'inicio' })
  } else {
    next()
  }
})

// --- SEO TÍTULO DA PÁGINA E ÍCONES DINÂMICOS ---
router.afterEach((to) => {
  nextTick(() => {
    // ✨ INÍCIO DA ALTERAÇÃO ✨
    // Função para criar ou atualizar uma meta tag
    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Garante que as meta tags para a experiência de app iOS estejam sempre presentes
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    // ✨ FIM DA ALTERAÇÃO ✨

    const authStore = useAuthStore()
    const clinic = authStore.user?.clinic
    const clinicName = clinic?.name
    const clinicLogo = clinic?.logoUrl
    const pageTitle = to.meta.title
    const defaultAppName = 'Clínica CRM'

    // Elementos do <head> que vamos atualizar
    const favicon = document.getElementById('favicon')
    const appleTouchIcon = document.getElementById('apple-touch-icon')

    // ✨ Atualiza o Favicon e o Ícone da Tela de Início (iOS)
    if (clinicLogo) {
      if (favicon) favicon.href = clinicLogo
      if (appleTouchIcon) appleTouchIcon.href = clinicLogo
    } else {
      if (favicon) favicon.href = '/activity.svg'
      // Se não tiver logo, voltamos ao padrão.
      if (appleTouchIcon) appleTouchIcon.href = '/activity.svg'
    }

    // ✨ Atualiza o título da página (usado como nome do app na tela de início)
    if (pageTitle && clinicName && to.meta.requiresAuth) {
      document.title = `${clinicName} - ${pageTitle}`
    } else if (pageTitle) {
      document.title = `${pageTitle} | ${defaultAppName}`
    } else {
      document.title = clinicName || defaultAppName
    }
  })
})

export default router
