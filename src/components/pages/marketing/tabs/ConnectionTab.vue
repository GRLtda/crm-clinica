<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { Smartphone, CheckCircle, XCircle, Loader, Wifi, QrCode, LogOut } from 'lucide-vue-next'
import { useCrmStore } from '@/stores/crm'

const crmStore = useCrmStore()

const status = computed(() => crmStore.status)
const qrCode = computed(() => crmStore.qrCode)
const isLoading = computed(() => crmStore.isLoading)
const connections = computed(() => crmStore.connections)

async function initiateConnection() {
  await crmStore.initiateOrResetConnection()
}

async function logoutConnection() {
  await crmStore.logoutConnection()
}

onMounted(() => {
  crmStore.getInitialStatus()
})

onUnmounted(() => {
  crmStore.stopPolling()
})
</script>

<template>
  <div class="connection-tab">
    <div class="connection-grid">
      <div class="connection-card add-connection">
        <h2>Adicionar Nova Conexão</h2>
        <p>
          Conecte o WhatsApp da sua clínica para habilitar o envio de mensagens automáticas e
          marketing.
        </p>

        <div v-if="status === 'disconnected'">
          <button @click="initiateConnection" :disabled="isLoading" class="btn-primary btn-connect">
            <Smartphone :size="18" />
            <span>Iniciar Conexão WhatsApp</span>
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

        <div v-if="status === 'qrcode'" class="qr-code-section">
          <p class="qr-instruction">Escaneie o QR Code abaixo com o WhatsApp:</p>
          <div class="qr-code-wrapper">
            <img v-if="qrCode" :src="qrCode" alt="QR Code WhatsApp" />
            <div v-else class="qr-placeholder">
              <Loader :size="24" class="animate-spin" /> Carregando QR Code...
            </div>
          </div>
          <p class="connection-info small">Aguardando leitura. Mantenha esta página aberta.</p>
        </div>

        <div v-if="status === 'connected'" class="status-display connected">
          <CheckCircle :size="24" />
          <span>WhatsApp conectado com sucesso!</span>
          <button
            @click="logoutConnection"
            :disabled="isLoading"
            class="btn-secondary btn-disconnect"
          >
            <LogOut :size="16" />
            <span>Desconectar</span>
          </button>
        </div>
      </div>

      <div class="connection-card active-connections">
        <h2>Conexões Ativas</h2>
        <div v-if="connections.length > 0" class="connections-list">
          <div v-for="conn in connections" :key="conn.id" class="connection-item">
            <div class="connection-details">
              <Wifi
                :size="20"
                :class="conn.status === 'connected' ? 'icon-connected' : 'icon-disconnected'"
              />
              <div>
                <span class="connection-name">{{ conn.name }}</span>
                <span class="connection-number">{{ conn.number }}</span>
              </div>
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
        <div v-else class="empty-list">Nenhuma conexão ativa no momento.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  align-items: start;
}

.connection-card {
  background-color: var(--branco);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.05),
    0 2px 4px -2px rgb(0 0 0 / 0.05);
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

.btn-secondary {
  background: var(--branco);
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}
.btn-secondary:disabled {
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
.status-display.connected {
  background-color: #f0fdf4;
  color: #16a34a;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.qr-code-section {
  text-align: center;
}
.qr-instruction {
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
}
.qr-code-wrapper {
  width: 250px;
  height: 250px;
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
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qr-placeholder {
  color: var(--cinza-texto);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary.btn-disconnect {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  margin-top: 1rem;
}
.btn-secondary.btn-disconnect:hover:not(:disabled) {
  background-color: #fecaca;
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
    width: 200px;
    height: 200px;
  }
  .connection-card {
    padding: 1.5rem;
  }
}
</style>
