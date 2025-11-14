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
    beforeEnter: (to, from, next) => {
      const hasToken = to.query.token || to.query.invitationToken

      if (!hasToken) {
        next({ name: 'landing' })
      } else {
        next()
      }
    },
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// --- GUARDAS GLOBAIS (afterEach e beforeEach) ---

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const hasClinic = authStore.hasClinic

  if (to.meta.public) {
    return next()
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // 4. Se a rota exige uma clínica (a maioria das rotas 'requiresAuth')
  if (to.meta.requiresAuth && !to.meta.public) {
    // E o usuário está autenticado MAS não tem clínica
    if (isAuthenticated && !hasClinic) {
      // E ele NÃO ESTÁ indo para o wizard
      if (to.name !== 'clinic-wizard') {
        // Força ele a ir para o wizard
        return next({ name: 'clinic-wizard' })
      }
    }

    // E o usuário está autenticado E TEM clínica
    if (isAuthenticated && hasClinic) {
      // Mas está tentando acessar o wizard
      if (to.name === 'clinic-wizard') {
        // Redireciona para o dashboard
        return next({ name: 'dashboard' })
      }
    }
  }

  // 5. Se nenhuma regra anterior barrou, permite a navegação
  next()
})


router.afterEach((to) => {
  // Esta função é executada após cada mudança de rota
  // Usamos 'nextTick' para garantir que o DOM seja atualizado
  // antes de tentarmos mudar o título do documento.
  nextTick(() => {
    // Função auxiliar para definir meta tags
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
      document.title = `${pageTitle} | ${clinicName}`
    } else if (pageTitle) {
      document.title = `${pageTitle} | ${defaultAppName}`
    } else if (clinicName) {
      document.title = clinicName
    } else {
      document.title = defaultAppName
    }

    // ✨ Atualiza o nome do app na tela de início (iOS)
    if (clinicName) {
      setMetaTag('apple-mobile-web-app-title', clinicName);
    } else {
      setMetaTag('apple-mobile-web-app-title', defaultAppName);
    }
  })
})

export default router
