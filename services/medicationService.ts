import { Medication } from '../types/medication';

const MEDICATIONS_KEY = 'glicosim_medications';

export const medicationService = {
  getMedications: (): Medication[] => {
    const data = localStorage.getItem(MEDICATIONS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as Partial<Medication>[];
    return parsed.map(med => ({
      ...(med as Medication),
      fabricante: med.fabricante?.trim() ? med.fabricante.trim() : 'Não informado'
    }));
  },

  saveMedication: (medication: Omit<Medication, 'id' | 'createdAt'>): void => {
    const medications = medicationService.getMedications();
    const newMed: Medication = {
      ...medication,
      fabricante: medication.fabricante?.trim() ? medication.fabricante.trim() : 'Não informado',
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    medications.push(newMed);
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  },

  updateMedication: (id: string, updates: Partial<Medication>): void => {
    const medications = medicationService.getMedications();
    const index = medications.findIndex(m => m.id === id);
    if (index !== -1) {
      const merged = { ...medications[index], ...updates };
      medications[index] = {
        ...merged,
        fabricante: merged.fabricante?.trim() ? merged.fabricante.trim() : 'Não informado'
      };
      localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    }
  },

  deleteMedication: (id: string): void => {
    const medications = medicationService.getMedications().filter(m => m.id !== id);
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  },

  decreaseStock: (nome: string, quantidade: number, unidade: string): boolean => {
    const medications = medicationService.getMedications();
    const med = medications.find(m => m.nome.toLowerCase() === nome.toLowerCase() && m.unidade === unidade);
    
    if (med && med.quantidade >= quantidade) {
      med.quantidade -= quantidade;
      localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
      return true;
    }
    return false;
  },

  getLowStockMedications: (): Medication[] => {
    return medicationService.getMedications().filter(m => m.quantidade <= m.limiteEstoque);
  }
};
