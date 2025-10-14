<script setup>
import { ref, watch, nextTick } from 'vue' // 1. Importar o nextTick
import { useAuthStore } from '@/stores/auth'
import { useClinicStore } from '@/stores/clinic'
import { useToast } from 'vue-toastification'
import { UploadCloud, Building } from 'lucide-vue-next'
import FormInput from '@/components/global/FormInput.vue'
import { fetchAddressByCEP } from '@/api/external'

const authStore = useAuthStore()
const clinicStore = useClinicStore()
const toast = useToast()

const isDataLoaded = ref(false) // 2. Criar a variável de controle
const logoInput = ref(null)
const selectedLogoFile = ref(null)
const logoPreviewUrl = ref('')

const clinicData = ref({
  name: '',
  cnpj: '',
  logoUrl: '',
  address: {
    cep: '',
    city: '',
    state: '',
    street: '',
    number: '',
    district: '',
  },
})

// 3. Modificar o 'watch' para usar a variável de controle
watch(
  () => authStore.user?.clinic,
  async (clinic) => {
    if (clinic) {
      isDataLoaded.value = false // Esconde o form temporariamente
      clinicData.value = JSON.parse(JSON.stringify(clinic))
      logoPreviewUrl.value = clinic.logoUrl || ''
      await nextTick() // Espera o Vue processar a mudança
      isDataLoaded.value = true // Mostra o form novamente, agora com os dados
    } else if (!authStore.isLoading) {
      isDataLoaded.value = true // Garante que o form apareça se não houver clínica
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => clinicData.value.address.cep,
  async (newCep) => {
    const numericCep = newCep.replace(/\D/g, '')
    if (numericCep.length === 8) {
      const address = await fetchAddressByCEP(numericCep)
      if (address) {
        clinicData.value.address.street = address.street
        clinicData.value.address.district = address.neighborhood
        clinicData.value.address.city = address.city
        clinicData.value.address.state = address.state
      }
    }
  },
)


function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }
  selectedLogoFile.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
}

async function handleUpdate() {
  const savingToast = toast.info('Salvando alterações...', { timeout: false })

  if (selectedLogoFile.value) {
    const formData = new FormData()
    formData.append('image', selectedLogoFile.value)

    const { success, data } = await clinicStore.uploadLogo(formData)

    if (success) {
      clinicData.value.logoUrl = data.logoUrl
    } else {
      toast.dismiss(savingToast)
      toast.error('Falha ao enviar o novo logo. Nenhuma alteração foi salva.')
      return
    }
  }

  const { success: updateSuccess } = await clinicStore.updateClinicDetails(clinicData.value)

  toast.dismiss(savingToast)

  if (updateSuccess) {
    toast.success('Informações da clínica salvas com sucesso!')
    selectedLogoFile.value = null
  } else {
    toast.error('Erro ao salvar as informações da clínica.')
  }
}
</script>

<template>
  <div class="general-settings">
    <form v-if="isDataLoaded" @submit.prevent="handleUpdate">
      <div class="main-content-grid">
        <div class="logo-upload-section">
          <label class="form-label">Logo da Clínica</label>
          <div class="logo-uploader">
            <img
              v-if="logoPreviewUrl"
              :src="logoPreviewUrl"
              alt="Logo da Clínica"
              class="logo-preview"
            />
            <div v-else class="logo-placeholder">
              <Building :size="40" />
            </div>
            <p>Envie uma imagem quadrada (PNG ou JPG)</p>
            <input
              type="file"
              @change="handleFileSelect"
              accept="image/png, image/jpeg"
              ref="logoInput"
              hidden
            />
            <button type="button" @click="logoInput.click()" class="btn-upload">
              <UploadCloud :size="16" />
              Trocar Imagem
            </button>
          </div>
        </div>

        <FormInput v-model="clinicData.name" label="Nome da Clínica" />
        <FormInput v-model="clinicData.cnpj" label="CNPJ" cnpj-mask />
        <FormInput v-model="clinicData.address.cep" label="CEP" />
        <FormInput v-model="clinicData.address.street" label="Rua" />
        <FormInput v-model="clinicData.address.number" label="Número" />
        <FormInput v-model="clinicData.address.district" label="Bairro" />
        <FormInput v-model="clinicData.address.city" label="Cidade" />
        <FormInput v-model="clinicData.address.state" label="Estado" />
      </div>

      <div class="footer-actions">
        <button type="submit" class="save-button">Salvar Alterações</button>
      </div>
    </form>
    <div v-else>
      <p>Carregando dados da clínica...</p>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  gap: 1rem 1.5rem;
  align-items: start;
}

.main-content-grid > :deep(.form-group) {
  margin-bottom: 0;
}

.logo-upload-section {
  grid-row: span 4;
}

.logo-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: center;
  height: 100%;
}

.logo-preview,
.logo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.logo-preview {
  object-fit: cover;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef2ff;
  color: var(--azul-principal);
  border: 2px dashed #c7d2fe;
}

.logo-uploader p {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  margin: 0;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--branco);
  border: 1px solid #d1d5db;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  width: fit-content;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.save-button {
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.save-button:hover {
  background-color: var(--azul-escuro);
}

/* ✨ MUDANÇAS PARA O RESPONSIVO ✨ */
@media (max-width: 900px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
  .logo-upload-section {
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .footer-actions {
    margin-top: 1.5rem;
  }
  .save-button {
    width: 100%;
  }
}
</style>
