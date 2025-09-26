import apiClient from './index';

// Busca a lista de todos os modelos de anamnese
export const getAnamnesisTemplates = () => {
  return apiClient.get('/anamnesis-templates'); // [cite: 28]
};

// Futuramente, adicionaremos as outras funções (criar, deletar, etc.)
