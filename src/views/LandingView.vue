<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppHeader from '@/components/global/AppHeader.vue'
import { ChevronRight, Check, X, Monitor, KeyRound, Rocket, Gem, Building } from 'lucide-vue-next'

const planos = ref([
  // {
  //   name: 'Essencial',
  //   icon: Rocket,
  //   price: 'R$ 99',
  //   period: '/mês',
  //   description: 'Perfeito para clínicas que estão começando.',
  //   featured: false,
  //   buttonText: 'Começar agora',
  //   benefits: ['Gestão de Pacientes', 'Agenda Online'],
  //   limitations: ['Prontuário Eletrônico', 'Faturamento e Cobranças'],
  // },
  // {
  //   name: 'Profissional',
  //   icon: Gem,
  //   price: 'R$ 199',
  //   period: '/mês',
  //   description: 'Ideal para clínicas em fase de crescimento.',
  //   featured: true,
  //   buttonText: 'Escolher plano',
  //   benefits: [
  //     'Tudo do plano Essencial',
  //     'Prontuário Eletrônico',
  //     'Faturamento e Cobranças',
  //     'Até 5 Usuários',
  //   ],
  //   limitations: ['APIs e Integrações'],
  // },
  {
    name: 'Empresarial',
    icon: Building,
    price: 'Contato',
    period: '',
    description: 'Para clínicas com múltiplas unidades e necessidades.',
    featured: false,
    buttonText: 'Fale conosco',
    benefits: [
      'Tudo do plano Profissional',
      'APIs e Integrações',
      'Suporte Dedicado',
      'Usuários Ilimitados',
    ],
    limitations: [],
  },
])

// Lógica para o efeito 3D
const platformImageWrapper = ref(null)
// Lógica para o carrossel
const plansGrid = ref(null)
const currentSlide = ref(0)
let scrollTimeout = null

function handleMouseMove(event) {
  if (!platformImageWrapper.value) return
  const el = platformImageWrapper.value
  const { width, height, left, top } = el.getBoundingClientRect()
  const x = event.clientX - left
  const y = event.clientY - top
  const mouseX = x / width - 0.5
  const mouseY = y / height - 0.5
  const rotateY = mouseX * 20
  const rotateX = -mouseY * 20
  el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
  el.style.transition = 'transform 0.1s linear'
}

function resetTilt() {
  if (!platformImageWrapper.value) return
  platformImageWrapper.value.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`
  platformImageWrapper.value.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
}

// Funções do Carrossel
function updateCurrentSlide() {
  if (!plansGrid.value) return
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    const scrollLeft = plansGrid.value.scrollLeft
    const slideWidth = plansGrid.value.children[0].offsetWidth
    const newSlide = Math.round(scrollLeft / slideWidth)
    currentSlide.value = newSlide
  }, 100)
}

function scrollToSlide(index) {
  if (!plansGrid.value) return
  plansGrid.value.scrollTo({
    left: index * plansGrid.value.children[0].offsetWidth,
    behavior: 'smooth',
  })
  currentSlide.value = index
}

onMounted(() => {
  plansGrid.value?.addEventListener('scroll', updateCurrentSlide)
})

onBeforeUnmount(() => {
  plansGrid.value?.removeEventListener('scroll', updateCurrentSlide)
})
</script>

<template>
  <AppHeader class="header-slide-down" />
  <main>
    <section class="hero">
      <div class="container">
        <h1 class="hero-title animate-slide-up">Sua clínica no piloto automático</h1>
        <p class="hero-subtitle animate-slide-up">
          Impulsione o sucesso da sua clínica com uma solução que elimina tarefas manuais e acelera
          o seu faturamento.
        </p>
        <div class="hero-actions animate-slide-up">
          <router-link to="/app" class="btn-primary"> Entrar <KeyRound :size="20" /> </router-link>
          <button class="btn-secondary">Agentes Digitais <ChevronRight :size="20" /></button>
        </div>
      </div>
    </section>

    <section class="platform-section">
      <div class="platform-container">
        <div class="platform-content">
          <div class="platform-icon">
            <Monitor :size="28" />
          </div>
          <h2 class="platform-title">Plataforma</h2>
          <p class="platform-description">
            Automatize cobranças e a emissão de documentos, centralize prontuários e agendamentos e
            aumente a eficiência da sua clínica.
          </p>
          <a href="#" class="btn-learn-more"> Saiba mais <ChevronRight :size="16" /> </a>
        </div>
        <div
          class="platform-image-wrapper"
          ref="platformImageWrapper"
          @mousemove="handleMouseMove"
          @mouseleave="resetTilt"
        >
          <div class="platform-image">
            <img
              src="https://placehold.co/600x400/FFF/31343C?text=Dashboard"
              alt="Interface da plataforma do ClínicaCRM"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="plans-section">
      <div class="container-plans">
        <h2 class="section-title">Planos flexíveis para sua necessidade</h2>
        <p class="section-subtitle">Comece de graça e evolua conforme sua clínica cresce.</p>
        <div class="plans-grid" ref="plansGrid">
          <div
            v-for="plano in planos"
            :key="plano.name"
            class="plan-card"
            :class="{ featured: plano.featured }"
          >
            <h3 class="plan-name">
              <component :is="plano.icon" :size="20" />
              <span>{{ plano.name }}</span>
            </h3>
            <p class="plan-price">
              {{ plano.price }}<span class="plan-period">{{ plano.period }}</span>
            </p>
            <p class="plan-description">{{ plano.description }}</p>

            <ul class="plan-features">
              <li v-for="benefit in plano.benefits" :key="benefit" class="benefit">
                <Check :size="16" /> {{ benefit }}
              </li>
            </ul>

            <ul v-if="plano.limitations.length > 0" class="plan-features">
              <li v-for="limitation in plano.limitations" :key="limitation" class="limitation">
                <X :size="16" /> {{ limitation }}
              </li>
            </ul>

            <button :class="plano.featured ? 'btn-primary-featured' : 'btn-outline'">
              {{ plano.buttonText }}
            </button>
          </div>
        </div>
        <div class="carousel-dots">
          <button
            v-for="(plano, index) in planos"
            :key="index"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="scrollToSlide(index)"
            :aria-label="`Ir para o plano ${plano.name}`"
          ></button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ANIMAÇÕES DE ENTRADA */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

:global(.header-slide-down) {
  animation: slideDown 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
.hero-title {
  animation-delay: 0.2s;
}
.hero-subtitle {
  animation-delay: 0.4s;
}
.hero-actions {
  animation-delay: 0.6s;
}

/* ESTILOS GERAIS */
main {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 40%, #dbeafe 0%, var(--branco) 50%);
}
.hero,
.plans-section,
.platform-section {
  position: relative;
  z-index: 2;
}
.hero {
  text-align: center;
  padding: 10rem 0 6rem 0;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}
.hero-title {
  font-size: 3.75rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
}
.hero-subtitle {
  font-size: 1.25rem;
  color: var(--cinza-texto);
  max-width: 600px;
  margin: 0 auto 2.5rem auto;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.hero-actions .btn-primary,
.hero-actions .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}
.btn-primary {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}
.btn-secondary {
  background-color: var(--cinza-claro);
  color: var(--preto);
  border: none;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* SEÇÃO PLATAFORMA */
.platform-section {
  padding: 6rem 0;
}
.platform-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 4rem;
}
.platform-content {
  flex-basis: 50%;
  text-align: left;
}
.platform-icon {
  margin-bottom: 1rem;
  color: var(--preto);
}
.platform-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.platform-description {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.7;
  margin-bottom: 2rem;
}
.btn-learn-more {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: var(--azul-principal);
  transition: gap 0.3s ease;
}
.btn-learn-more:hover {
  gap: 0.5rem;
}

/* EFEITO 3D NA IMAGEM */
.platform-image-wrapper {
  flex-basis: 50%;
  transform-style: preserve-3d;
}
.platform-image {
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(80, 80, 120, 0.2);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}
.platform-image img {
  width: 100%;
  display: block;
}

/* SEÇÃO DE PLANOS */
.plans-section {
  padding: 6rem 0;
}
.container-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.section-subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  margin-bottom: 4rem;
}
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: left;
}
.plan-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}
.plan-card.featured {
  background-color: var(--preto);
  color: var(--branco);
  border-color: var(--preto);
}
.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.plan-price {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.plan-period {
  font-size: 1rem;
  font-weight: 500;
  color: var(--cinza-texto);
}
.featured .plan-period {
  color: #a1a1aa;
}
.plan-description {
  margin-bottom: 2rem;
  min-height: 40px;
}
.featured .plan-description {
  color: #d4d4d8;
}
.plan-features {
  list-style: none;
  margin-bottom: 2rem;
  padding: 0;
  flex-grow: 1;
}
.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.benefit svg {
  color: var(--azul-principal);
}
.limitation svg {
  color: #ef4444;
}
.featured .limitation {
  color: #a1a1aa;
}
.btn-outline {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--preto);
  color: var(--preto);
  background-color: transparent;
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background-color: var(--preto);
  color: var(--branco);
}
.btn-primary-featured {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--azul-principal);
  background-color: var(--azul-principal);
  color: var(--branco);
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-primary-featured:hover {
  background-color: var(--azul-escuro);
}
.carousel-dots {
  display: none; /* Escondido por padrão no desktop */
}

/* --- AJUSTES DE RESPONSIVIDADE --- */

/* TABLETS (até 1024px) */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }
}

/* CELULARES (até 768px) */
@media (max-width: 768px) {
  .hero { padding: 8rem 0 5rem 0; }
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1.125rem; }
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-actions .btn-primary,
  .hero-actions .btn-secondary {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .platform-section { padding: 4rem 0; }
  .platform-container { flex-direction: column; text-align: center; }
  .platform-content { display: flex; flex-direction: column; align-items: center; }

  .plans-section { padding: 4rem 0; }
  .section-title { font-size: 2rem; }

  /* --- LÓGICA DO CARROSSEL --- */
  .plans-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2rem;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    max-width: none;
    grid-template-columns: none; /* Reseta o grid */
  }
  .plans-grid::-webkit-scrollbar {
    display: none;
  }
  .plan-card {
    flex: 0 0 90%;
    scroll-snap-align: center;
    max-width: 400px;
  }
  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #d1d5db;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.3s ease;
  }
  .dot.active {
    background-color: var(--azul-principal);
  }
}
</style>
