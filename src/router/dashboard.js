// src/router/dashboard.js

// Layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'

// Views do Dashboard
import Inicio from '../views/pages/inicio.vue'
import SettingsView from '../views/pages/configuracoes/SettingsView.vue'

const dashboardRoutes = [
  {
    path: '/app',
    component: DefaultLayout,
    meta: { requiresAuth: true }, // A rota pai continua protegida
    children: [
      {
        path: '',
        name: 'inicio',
        component: Inicio,
      },
      {
        path: 'configuracoes',
        name: 'configuracoes',
        component: SettingsView,
      },
      // Futuramente, a rota /app/pacientes entrará aqui
      // {
      //   path: 'pacientes',
      //   name: 'pacientes',
      //   component: () => import('@/views/pages/pacientes/PacientesListView.vue')
      // },
    ],
  },
]

export default dashboardRoutes
