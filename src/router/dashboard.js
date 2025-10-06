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
        meta: { title: 'Resumo' },
      },
      {
        path: 'configuracoes',
        name: 'configuracoes',
        component: SettingsView,
        meta: { title: 'Configurações' },
      },
      { path: 'pacientes', name: 'pacientes', component: PatientsListView, meta: { title: 'Pacientes' } },
      {
        path: 'pacientes/novo',
        name: 'novo-paciente',
        component: CreatePatientView,
        meta: { title: 'Novo Paciente' },
      },
      {
        path: 'pacientes/:id',
        name: 'detalhes-paciente',
        component: PatientDetailView,
        meta: { title: 'Detalhes do Paciente' },
      },
      {
        path: 'atendimentos',
        name: 'atendimentos',
        component: AppointmentsView,
        meta: { title: 'Atendimentos' },
      },
      {
        path: 'atendimentos/:appointmentId/patient/:patientId',
        name: 'atendimento-em-andamento',
        component: InProgressAppointmentView,
        meta: { title: 'Em Atendimento', layout: { noPadding: true } },
      },
    ],
  },
]

export default dashboardRoutes
