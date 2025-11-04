<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClinicStore } from '@/stores/clinic'
import { useToast } from 'vue-toastification'
import { UploadCloud, Building, LayoutList, MapPin } from 'lucide-vue-next'
import FormInput from '@/components/global/FormInput.vue'
import { fetchAddressByCEP } from '@/api/external'
import { onBeforeRouteLeave } from 'vue-router'

const authStore = useAuthStore()
const clinicStore = useClinicStore()
const toast = useToast()

const isDataLoaded = ref(false)
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
    complement: '',
  },
})

const originalClinicData = ref(null)

watch(
  () => authStore.user?.clinic,
  async (clinic) => {
    if (clinic) {
      isDataLoaded.value = false

      const clinicWithDefaults = {
          ...clinic,
          address: {
              ...clinic.address,
              complement: clinic.address?.complement || '',
          }
      }

      originalClinicData.value = JSON.parse(JSON.stringify(clinicWithDefaults))

      clinicData.value = JSON.parse(JSON.stringify(clinicWithDefaults))
      logoPreviewUrl.value = clinic.logoUrl || ''
      await nextTick()
      isDataLoaded.value = true
    } else if (!authStore.isLoading) {
      isDataLoaded.value = true
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => clinicData.value.address.cep,
  async (newCep) => {
    const currentComplement = clinicData.value.address.complement;

    const numericCep = newCep.replace(/\D/g, '')
    if (numericCep.length === 8) {
      const address = await fetchAddressByCEP(numericCep)
      if (address) {
        clinicData.value.address.street = address.street
        clinicData.value.address.district = address.neighborhood
        clinicData.value.address.city = address.city
        clinicData.value.address.state = address.state
        clinicData.value.address.complement = currentComplement;
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
    originalClinicData.value = JSON.parse(JSON.stringify(clinicData.value))
  } else {
    toast.error('Erro ao salvar as informações da clínica.')
  }
}

const hasUnsavedChanges = computed(() => {
    if (!originalClinicData.value || !clinicData.value) return false;

    return JSON.stringify(originalClinicData.value) !== JSON.stringify(clinicData.value);
});

onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
        const confirmation = window.confirm(
            'Você tem alterações não salvas. Deseja realmente sair sem salvar?'
        );
        if (confirmation) {
            next();
        } else {
            next(false);
        }
    } else {
        next();
    }
});
</script>

<template>
  <div class="general-settings">
    <form v-if="isDataLoaded" @submit.prevent="handleUpdate">
      <div class="page-content-grid">

        <div class="info-card basic-info-card">
            <div class="section-header">
                <LayoutList :size="20" />
                <h3>Informações Básicas</h3>
            </div>

            <div class="fields-grid grid-logo-and-fields">
                <div class="logo-col-wrapper">
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

                <div class="text-fields-wrapper">
                    <FormInput v-model="clinicData.name" label="Nome da Clínica" required />
                    <FormInput v-model="clinicData.cnpj" label="CNPJ" cnpj-mask required />
                </div>
            </div>
        </div>

        <div class="info-card address-card">
            <div class="section-header">
                <MapPin :size="20" />
                <h3>Endereço da Clínica</h3>
            </div>

            <div class="fields-grid grid-address">
                <FormInput v-model="clinicData.address.cep" label="CEP" placeholder="00000-000" class="col-small-uniform" required />
                <FormInput v-model="clinicData.address.street" label="Rua / Logradouro" placeholder="Ex: Rua das Flores" class="span-2-uniform" required />

                <FormInput v-model="clinicData.address.number" label="Número" placeholder="Ex: 123 ou S/N" class="col-small-uniform" required />
                <FormInput
                    v-model="clinicData.address.complement"
                    label="Complemento (Opcional)"
                    placeholder="Ex: Sala 101, Fundos"
                    class="col-small-uniform"
                />
                <FormInput v-model="clinicData.address.district" label="Bairro" placeholder="Ex: Centro" class="col-small-uniform" />

                <FormInput v-model="clinicData.address.city" label="Cidade" placeholder="Ex: São Paulo" class="span-2-uniform" />
                <FormInput v-model="clinicData.address.state" label="Estado" placeholder="Ex: SP" class="col-small-uniform" />
            </div>
        </div>

      </div>

      <div class="footer-actions">
        <span v-if="hasUnsavedChanges" class="unsaved-changes-alert">
            Você tem alterações não salvas.
        </span>
        <button type="submit" class="save-button">Salvar Alterações</button>
      </div>
    </form>
    <div v-else class="loading-state-placeholder">
      <p>Carregando dados da clínica...</p>
    </div>
  </div>
</template>

<style scoped>
/* CORES */
:root {
    --cinza-texto: #6b7280;
    --azul-principal: #3b82f6;
    --branco: #ffffff;
    --cinza-claro: #f9fafb;
    --borda: #e5e7eb;
    --azul-escuro: #2563eb;
    --laranja-alerta: #f59e0b;
    --input-uniform-width: 200px;
}

/* ------------------------------------------- */
/* CLASSES AUXILIARES PARA LARGURA E SPAN      */
/* ------------------------------------------- */
/* Classes para o novo layout uniforme */
.col-small-uniform { max-width: var(--input-uniform-width); grid-column: span 1; }
.span-2-uniform { max-width: calc(2 * var(--input-uniform-width) + 1.5rem); grid-column: span 2; }

/* ------------------------------------------- */
/* ESTILOS DE LARGURA DO FORMINPUT INTERNO     */
/* ------------------------------------------- */
/* Garante que os inputs internos sigam a largura do elemento pai */
:deep(.form-group) {
    max-width: var(--input-uniform-width);
}
:deep(.form-group.span-2) {
    max-width: 100%;
}
/* SOBRESCREVENDO: Inputs de endereço usam as novas classes uniformes */
:deep(.form-group.col-small-uniform) {
    max-width: var(--input-uniform-width);
}
:deep(.form-group.span-2-uniform) {
    max-width: 100%;
}
/* FIM DOS ESTILOS DE LARGURA */


/* ------------------------------------------- */
/* LAYOUT PRINCIPAL (DOIS CARDS LADO A LADO)   */
/* ------------------------------------------- */
.page-content-grid {
    display: grid;
    /* ✨ ALTERAÇÃO CRÍTICA: 0.7fr para Básicas, 1.3fr para Endereço */
    grid-template-columns: 0.7fr 1.3fr;
    gap: 1.5rem;
    align-items: start;
    margin-bottom: 1.5rem;
}

/* ------------------------------------------- */
/* ESTILOS DOS CARDS E SEÇÕES                  */
/* ------------------------------------------- */
.info-card {
    background-color: var(--branco);
    border: 1px solid var(--borda);
    border-radius: 0.75rem;
}
.section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--azul-escuro);
    margin-bottom: 1.5rem;
    font-weight: 600;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 0.75rem;
}
.section-header h3 {
    font-size: 1.125rem;
    margin: 0;
}

/* GRID DE CAMPOS INTERNA */
.fields-grid {
    display: grid;
    gap: 1rem 1.5rem;
    align-items: start;
}

/* Grid de Endereço (3 colunas uniformes) */
.grid-address {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

/* Grid Básico */
.grid-logo-and-fields {
    grid-template-columns: 200px 1fr;
    gap: 1.5rem;
}

.text-fields-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.5rem;
}
.text-fields-wrapper > :deep(.form-group) {
    margin-bottom: 0;
}

/* ------------------------------------------- */
/* UPLOADER DE LOGO                            */
/* ------------------------------------------- */
.logo-col-wrapper {
    align-self: start;
    border-right: 1px solid #f3f4f6;
    padding-right: 1.5rem;
}
.logo-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--cinza-claro);
  border-radius: 0.75rem;
  border: 1px dashed var(--borda);
  text-align: center;
  width: 100%;
}
.logo-preview, .logo-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 0.75rem;
  flex-shrink: 0;
}
.logo-preview { object-fit: cover; border: 1px solid var(--borda); }
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

/* ------------------------------------------- */
/* RODAPÉ E AÇÕES                              */
/* ------------------------------------------- */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--borda);
}
.unsaved-changes-alert {
    color: var(--laranja-alerta);
    font-size: 0.875rem;
    font-weight: 600;
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
.loading-state-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: var(--cinza-texto);
}

/* ------------------------------------------- */
/* RESPONSIVIDADE                              */
/* ------------------------------------------- */
@media (max-width: 1000px) {
    /* Em telas menores, os dois cards principais empilham */
    .page-content-grid {
        grid-template-columns: 1fr;
    }
    .info-card {
        padding: 1rem 1.5rem;
    }

    /* Logo e campos de texto empilham */
    .grid-logo-and-fields {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .logo-col-wrapper {
        border-right: none;
        padding-right: 0;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f3f4f6;
        align-self: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .text-fields-wrapper {
        padding-top: 0;
    }

    /* Campos de endereço em 2 colunas */
    .grid-address {
        grid-template-columns: 1fr 1fr;
    }
    .grid-address > .span-2-uniform {
        grid-column: span 2;
    }
}

@media (max-width: 600px) {
    /* Mobile: Tudo em coluna única */
    .logo-col-wrapper {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    .logo-uploader {
        flex-direction: column;
        justify-content: center;
        width: 100%;
    }
    .logo-uploader p { text-align: center; }

    .grid-address { grid-template-columns: 1fr; }
    .span-2-uniform, .col-small-uniform { grid-column: span 1; }

    /* Remove a largura máxima fixa para o mobile */
    :deep(.form-group) { max-width: 100%; }
    .footer-actions {
        flex-direction: column-reverse;
        align-items: stretch;
    }
    .save-button { width: 100%; }
}
</style>
