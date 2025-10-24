import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  initiateWhatsAppConnection,
  checkWhatsAppStatus,
  logoutWhatsAppConnection,
} from '@/api/crm'
import { useToast } from 'vue-toastification'

export const useCrmStore = defineStore('crm', () => {
  const toast = useToast()

  const status = ref('disconnected')
  const qrCode = ref(null)
  const isLoading = ref(false)
  const isPolling = ref(false)
  const connections = ref([])
  let statusPollingInterval = null
  let isFetchingQrCode = false
  let initializingDisconnectRetryCount = 0

  function stopPolling() {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
      statusPollingInterval = null
      isPolling.value = false
    }
  }

  async function fetchQrCode() {
    if (isFetchingQrCode) {
      return
    }
    isFetchingQrCode = true
    try {
      const response = await initiateWhatsAppConnection()
      if (response.data.status === 'qrcode' && response.data.qrCode) {
        qrCode.value = response.data.qrCode
        status.value = 'qrcode'
      } else {
        if (qrCode.value) {
           qrCode.value = null;
        }
      }
    } catch (error) {
      toast.error('Falha ao obter QR Code.')
      status.value = 'disconnected'
      qrCode.value = null
      stopPolling()
    } finally {
      isFetchingQrCode = false
    }
  }

  async function checkStatus() {
    if (isLoading.value) return

    try {
      const response = await checkWhatsAppStatus()
      const newApiStatus = response.data.status
      const previousStatus = status.value

      if (
        previousStatus === 'initializing' &&
        newApiStatus === 'disconnected' &&
        initializingDisconnectRetryCount < 3
      ) {
        initializingDisconnectRetryCount++
        stopPolling()
        startPolling(1500)
        return
      }
      if (previousStatus === 'initializing' && newApiStatus !== 'disconnected') {
        initializingDisconnectRetryCount = 0
      }


      switch (newApiStatus) {
        case 'connected':
          if (previousStatus !== 'connected') {
             status.value = 'connected'
             toast.success(response.data.message || 'WhatsApp conectado!')
             connections.value = [ { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }]
          }
          qrCode.value = null
          stopPolling()
          initializingDisconnectRetryCount = 0
          break

        case 'disconnected':
           if (previousStatus !== 'disconnected' && (previousStatus !== 'initializing' || initializingDisconnectRetryCount >= 3)) {
             status.value = 'disconnected'
             toast.info(response.data.message || 'WhatsApp desconectado.')
             connections.value = []
           }
          qrCode.value = null
          if (previousStatus !== 'initializing' || initializingDisconnectRetryCount >= 3) {
            stopPolling()
            initializingDisconnectRetryCount = 0
          }
          break

        case 'creating_qr':
          if (previousStatus !== 'creating_qr') {
            status.value = 'creating_qr'
            qrCode.value = null
             stopPolling()
             startPolling(2000)
          }
          initializingDisconnectRetryCount = 0
          break

        case 'qrcode_pending':
          if (previousStatus !== 'qrcode_pending') {
            status.value = 'qrcode_pending';
            qrCode.value = null;
          }

          if (!qrCode.value && !isFetchingQrCode) {
            fetchQrCode();
          }

          if (!isPolling.value || statusPollingInterval === null || statusPollingInterval?._repeat !== 4000) {
              stopPolling();
              startPolling(4000);
          }
          initializingDisconnectRetryCount = 0;
          break

        case 'qrcode':
           status.value = 'qrcode_pending'
           qrCode.value = null
           if (!isFetchingQrCode) {
               fetchQrCode()
           }
            if (!isPolling.value || statusPollingInterval === null || statusPollingInterval?._repeat !== 4000) {
                stopPolling()
                startPolling(4000);
            }
           initializingDisconnectRetryCount = 0
           break


        case 'initializing':
          if (previousStatus !== 'initializing') {
            status.value = 'initializing'
            qrCode.value = null
            stopPolling()
            startPolling(2000)
          }
          if (previousStatus === 'disconnected') initializingDisconnectRetryCount = 0
          break

        default:
          initializingDisconnectRetryCount = 0
          if (previousStatus !== newApiStatus) {
            status.value = newApiStatus
          }
           if (!isPolling.value) startPolling(5000)
      }

    } catch (error) {
      initializingDisconnectRetryCount = 0
      if (error.response?.status !== 404) {
        toast.error('Erro ao verificar status da conexão.')
      }
      if (status.value !== 'disconnected') {
         status.value = 'disconnected'
         qrCode.value = null
         connections.value = []
      }
      stopPolling()
    }
  }

  function startPolling(interval = 5000) {
    stopPolling()
    isPolling.value = true
    setTimeout(checkStatus, interval)
    statusPollingInterval = setInterval(checkStatus, interval)
  }

  async function initiateOrResetConnection() {
    if (isLoading.value) return
    isLoading.value = true
    qrCode.value = null
    status.value = 'initializing'
    stopPolling()
    initializingDisconnectRetryCount = 0

    try {
      const statusResponse = await checkWhatsAppStatus()

      if (statusResponse.data.status === 'connected') {
        status.value = 'connected'
        toast.info('WhatsApp já está conectado.')
        connections.value = [
          { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' },
        ]
        isLoading.value = false
        return
      }
      if (statusResponse.data.status === 'qrcode_pending') {
          status.value = 'qrcode_pending'
          startPolling(4000) // Ajustado para 4s
          isLoading.value = false
          return
      }
       if (statusResponse.data.status === 'qrcode') {
           status.value = 'qrcode_pending'
           startPolling(4000) // Ajustado para 4s
           isLoading.value = false
           return
       }
       if (statusResponse.data.status === 'creating_qr' || statusResponse.data.status === 'initializing') {
            status.value = statusResponse.data.status
            startPolling(2000)
            isLoading.value = false
            return
       }

      const initiateResponse = await initiateWhatsAppConnection()
      const initialStatusFromInitiate = initiateResponse.data.status;
      status.value = initialStatusFromInitiate;

      if (initialStatusFromInitiate === 'creating_qr' || initialStatusFromInitiate === 'initializing') {
         startPolling(2000)
      } else {
         startPolling(4000) // Ajustado para 4s para qrcode_pending ou qrcode direto
         if (initialStatusFromInitiate === 'qrcode_pending' && !isFetchingQrCode) {
             fetchQrCode();
         }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao iniciar conexão com WhatsApp.')
      status.value = 'disconnected'
      stopPolling()
    } finally {
      if (!isPolling.value) isLoading.value = false
    }
  }

  async function logoutConnection() {
    if (isLoading.value) return
    isLoading.value = true
    stopPolling()
    initializingDisconnectRetryCount = 0
    try {
      const response = await logoutWhatsAppConnection()
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = []
      toast.success(response.data.message || 'Sessão WhatsApp encerrada.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao desconectar do WhatsApp.')
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function getInitialStatus() {
    stopPolling()
    initializingDisconnectRetryCount = 0
    isLoading.value = true
    try {
      await checkStatus()
    } catch (e) {
      if(status.value !== 'disconnected') {
        status.value = 'disconnected'
        qrCode.value = null
        connections.value = []
      }
    } finally {
      isLoading.value = false
    }
  }


  return {
    status,
    qrCode,
    isLoading,
    isPolling,
    connections,
    initiateOrResetConnection,
    logoutConnection,
    getInitialStatus,
    stopPolling,
  }
})
