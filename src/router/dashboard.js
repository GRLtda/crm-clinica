// src/router/dashboard.js

// Layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'

// Views do Dashboard
import Inicio from '../views/pages/inicio.vue'
import SettingsView from '../views/pages/configuracoes/SettingsView.vue'
import PatientsListView from '../views/pages/pacientes/PatientsListView.vue'
import CreatePatientView from '../views/pages/pacientes/CreatePatientView.vue'
import PatientDetailView from '../views/pages/pacientes/PatientDetailView.vue'
import AppointmentsView from '../views/pages/atendimentos/AppointmentsView.vue'
import InProgressAppointmentView from '../views/pages/atendimentos/InProgressAppointmentView.vue'

const dashboardRoutes = [
  {
    path: '/app',
    component: DefaultLayout,
    meta: { requiresAuth: true },
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
      { path: 'pacientes', name: 'pacientes', component: PatientsListView },
      { path: 'pacientes/novo', name: 'novo-paciente', component: CreatePatientView },
      { path: 'pacientes/:id', name: 'detalhes-paciente', component: PatientDetailView },
      { path: 'atendimentos', name: 'atendimentos', component: AppointmentsView },
      {
        path: 'atendimentos/:appointmentId/patient/:patientId',
        name: 'atendimento-em-andamento',
        component: InProgressAppointmentView
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
