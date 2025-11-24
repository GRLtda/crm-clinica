<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { Smartphone, CheckCircle, XCircle, Loader, Wifi, QrCode, LogOut, ShieldCheck, Lock } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'

const crmStore = useCrmStore()

const status = computed(() => crmStore.status)
const qrCode = computed(() => crmStore.qrCode)
const isLoading = computed(() => crmStore.isLoading) // Loading geral da store
const connections = computed(() => crmStore.connections)
const isLoadingQrImage = computed(() => crmStore.isLoadingQrImage) // Pega o novo estado

const isTransitioning = ref(false)
const lastQrCode = ref('')

// Persiste o último QR Code válido para a animação
watch(qrCode, (newQr) => {
  if (newQr) {
    lastQrCode.value = newQr
  }
})

watch(status, (newStatus, oldStatus) => {
  // Só anima se não vier de 'disconnected' (evita animação ao recarregar a página já conectado)
  if (newStatus === 'connected' && oldStatus !== 'disconnected') {
    isTransitioning.value = true
    setTimeout(() => {
      isTransitioning.value = false
    }, 2000) // 2 segundos de transição
  }
})

async function initiateConnection() {
  await crmStore.initiateOrResetConnection()
}

async function logoutConnection() {
  await crmStore.logoutConnection()
}

async function getInitialStatus() {
  await crmStore.getInitialStatus()
}

function formatPhoneNumber(jid) {
  if (!jid) return 'Número desconhecido';
  // Remove o sufixo @s.whatsapp.net
  const number = jid.replace('@s.whatsapp.net', '');
  
  // Formatação simples para números brasileiros (ex: 5515991136994 -> +55 (15) 99113-6994)
  // Verifica se começa com 55 e tem tamanho suficiente
  if (number.startsWith('55') && number.length >= 12) {
    const ddd = number.substring(2, 4);
    const prefix = number.substring(4, number.length - 4);
    const suffix = number.substring(number.length - 4);
    return `+55 (${ddd}) ${prefix}-${suffix}`;
  }
  
  return number;
}

onMounted(() => {
  getInitialStatus()
})

onUnmounted(() => {
  crmStore.stopPolling()
})
</script>

<template>
  <div class="connection-tab">
    
    <!-- VIEW CONECTADO -->
    <div v-if="status === 'connected' && !isTransitioning" class="connected-view">
      <div class="premium-card">
        <!-- Header com Gradiente -->
        <div class="card-header-gradient">
          <div class="header-content">
            <div class="status-pill">
              <span class="pulse-dot"></span>
              Online
            </div>
          </div>
        </div>

        <!-- Conteúdo Principal -->
        <div class="card-body">
          <div class="profile-section">
            <div class="profile-image-container">
              <img
                v-if="connections[0]?.profileImage"
                :src="connections[0].profileImage"
                alt="Perfil WhatsApp"
                class="profile-image"
              />
              <div v-else class="profile-image-placeholder">
                <Smartphone :size="40" />
              </div>
              <div class="check-badge">
                <CheckCircle :size="16" />
              </div>
            </div>
            
            <div class="profile-text">
              <h2 class="profile-name">{{ connections[0]?.username || connections[0]?.name || 'WhatsApp' }}</h2>
              <p class="profile-number">{{ formatPhoneNumber(connections[0]?.number) }}</p>
            </div>
          </div>

          <!-- Grid de Informações -->
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value text-green">Ativo</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ambiente</span>
              <span class="info-value">Produção</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo</span>
              <span class="info-value">Multi-device</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sessão</span>
              <span class="info-value">{{ connections[0]?.name || 'Principal' }}</span>
            </div>
          </div>

          <!-- Ações -->
          <div class="actions-section">
            <button
              @click="logoutConnection"
              :disabled="isLoading"
              class="btn-disconnect-premium"
            >
              <LogOut :size="18" />
              <span>{{ isLoading ? 'Desconectando...' : 'Desconectar Sessão' }}</span>
            </button>
          </div>
        </div>

        <!-- Footer de Segurança -->
        <div class="card-footer">
          <ShieldCheck :size="16" class="footer-icon" />
          <span>Conexão criptografada de ponta a ponta</span>
        </div>
      </div>
    </div>

    <!-- VIEW DESCONECTADO / CONECTANDO -->
    <div v-else class="connection-grid">
      <div class="connection-card add-connection">
        <h2>Adicionar Nova Conexão</h2>
        <p>
          Conecte o WhatsApp da sua clínica para habilitar o envio de mensagens automáticas e
          marketing.
        </p>

        <div v-if="status === 'disconnected'">
          <button @click="initiateConnection" :disabled="isLoading" class="btn-primary btn-connect">
            <Smartphone :size="18" />
            <span>{{ isLoading ? 'Iniciando...' : 'Iniciar Conexão WhatsApp' }}</span>
          </button>
          <p class="connection-info">
            Ao clicar, um QR Code será gerado. Escaneie-o com o aplicativo WhatsApp no celular da
            clínica.
          </p>
        </div>

        <div v-if="status === 'creating_qr'" class="status-display creating-qr">
          <Loader :size="24" class="animate-spin" />
          <span>Criando QR Code... Aguarde alguns segundos.</span>
        </div>

        <div v-if="status === 'initializing'" class="status-display initializing">
          <Loader :size="24" class="animate-spin" />
          <span>Inicializando... Aguarde enquanto preparamos a conexão.</span>
        </div>

        <div v-if="status === 'qrcode_pending' || status === 'qrcode' || isTransitioning" class="qr-code-section">
           <p class="qr-instruction" v-if="!isTransitioning">Escaneie o QR Code abaixo com o WhatsApp:</p>
           <p class="qr-instruction success-text" v-else>Conectado com sucesso!</p>
           
           <div class="qr-code-wrapper">
                 <img
                   v-if="qrCode || (isTransitioning && lastQrCode)"
                   :src="qrCode || lastQrCode"
                   alt="QR Code WhatsApp"
                   :class="{ 'fade-out': isLoadingQrImage && qrCode, 'qr-blur': isTransitioning }" />
                 
                 <div v-if="isLoadingQrImage" class="qr-placeholder loading-overlay">
                    <Loader :size="24" class="animate-spin" /> Carregando QR Code...
                 </div>
                 <div v-else-if="!qrCode && !isLoadingQrImage && !isTransitioning" class="qr-placeholder">
                     Aguardando QR code...
                 </div>

                 <!-- Overlay de Sucesso -->
                 <div v-if="isTransitioning" class="success-overlay">
                    <CheckCircle :size="48" class="success-icon" />
                 </div>
           </div>
           <p class="connection-info small" v-if="!isTransitioning">Aguardando leitura. Mantenha esta página aberta.</p>
         </div>
      </div>

      <!-- Lista de conexões ativas (só aparece se NÃO estiver conectado na principal, o que é raro nesse fluxo, mas mantido por compatibilidade) -->
      <div class="connection-card active-connections" v-if="connections.length > 0 && !isTransitioning">
        <h2>Conexões Ativas</h2>
        <div class="connections-list">
          <div v-for="conn in connections" :key="conn.id" class="connection-item">
            <div class="connection-details">
              <Wifi
                :size="20"
                :class="conn.status === 'connected' ? 'icon-connected' : 'icon-disconnected'"
              />
              <div>
                <span class="connection-name">{{ conn.name }}</span>
                <span class="connection-number">{{ formatPhoneNumber(conn.number) }}</span> </div>
            </div>
            <span class="connection-status" :class="`status--${conn.status}`">
              {{ conn.status === 'connected' ? 'Conectado' : 'Desconectado' }}
            </span>
            <button
              v-if="conn.status === 'connected'"
              @click="logoutConnection"
              :disabled="isLoading"
              class="btn-icon btn-disconnect-list"
              title="Desconectar"
            >
              <XCircle :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connection-tab {
  max-width: 500px;
  margin: 2rem auto;
}

/* --- VIEW CONECTADO --- */
.connected-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 500px;
  margin: 2rem auto; /* Centraliza na tela */
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  width: 100%;
}

/* --- VIEW CONECTADO --- */
.connected-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.premium-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  height: 100px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
}

.status-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-body {
  padding: 0 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  margin-top: -50px; /* Puxa para cima do header */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-image-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.profile-image-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.check-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  padding: 2px;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-text {
  text-align: center;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.profile-number {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #f3f4f6;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.info-value {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}

.text-green {
  color: #059669;
}

.btn-disconnect-premium {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background-color: white;
  color: #ef4444;
  border: 1px solid #fee2e2;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-disconnect-premium:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-1px);
}

.card-footer {
  background-color: #f8fafc;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-top: 1px solid #e5e7eb;
  color: #64748b;
  font-size: 0.8rem;
}

.footer-icon {
  color: #94a3b8;
}

.connection-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--preto);
}

.connection-card p {
  color: var(--cinza-texto);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.qr-code-wrapper {
  position: relative; 
  width: 100%;
  max-width: 250px;
  aspect-ratio: 1;
  height: auto;
  margin: 0 auto;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.qr-code-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease-in-out; 
}

.qr-code-wrapper img.fade-out {
  opacity: 0.3; 
}

.qr-placeholder.loading-overlay {
  position: absolute; 
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(243, 244, 246, 0.8); 
  display: flex; 
  align-items: center;
  justify-content: center;
  color: var(--cinza-texto);
  font-size: 0.875rem;
  gap: 0.5rem;
  border-radius: 0.5rem; 
  z-index: 1; 
}

.qr-placeholder {
  color: var(--cinza-texto);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--azul-escuro);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary.btn-connect {
  width: 100%;
  justify-content: center;
  padding: 0.875rem;
  margin-bottom: 1rem;
}

.connection-info {
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 0.5rem;
}
.connection-info.small {
  margin-top: 1rem;
  font-size: 0.75rem;
}

.status-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 0.75rem;
  text-align: center;
  font-weight: 500;
}
.status-display.creating-qr {
  background-color: #fef3c7;
  color: #d97706;
}
.status-display.initializing {
  background-color: #f0f9ff;
  color: #0284c7;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qr-code-section {
  text-align: center;
}
.qr-instruction {
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.connection-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.connection-details {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.connection-details div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.icon-connected {
  color: #10b981;
}
.icon-disconnected {
  color: #f87171;
}
.connection-name {
  font-weight: 600;
  color: var(--preto);
}
.connection-number {
  font-size: 0.8rem;
  color: var(--cinza-texto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.connection-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  white-space: nowrap;
}
.status--connected {
  background-color: #dcfce7;
  color: #16a34a;
}
.status--disconnected {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cinza-texto);
}
.btn-icon:hover {
  background-color: #f3f4f6;
}
.btn-disconnect-list {
  color: #ef4444;
}
.btn-disconnect-list:hover {
  background-color: #fee2e2;
}

.empty-list {
  text-align: center;
  color: var(--cinza-texto);
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .connection-grid {
    grid-template-columns: 1fr;
  }
  .qr-code-wrapper {
    max-width: 200px;
  }
  .connection-card {
    padding: 1.5rem;
  }
}

.qr-blur {
  filter: blur(4px);
  opacity: 0.6;
}

.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.3s ease-out;
}

.success-icon {
  color: #10b981;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-text {
  color: #10b981;
  font-weight: 600;
  animation: slideDown 0.3s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
