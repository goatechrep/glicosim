import { Medication } from '../types/medication';
import { activityService } from './activityService';

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
    activityService.logActivity({
      title: 'Medicamento cadastrado',
      description: `${newMed.nome} entrou no estoque com ${newMed.quantidade} ${newMed.unidade}.`,
      icon: 'medication',
      accent: 'blue',
      category: 'medication',
      metadata: { medicationId: newMed.id },
    });
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
      activityService.logActivity({
        title: 'Medicamento atualizado',
        description: `${medications[index].nome} teve os dados de estoque ajustados.`,
        icon: 'edit_note',
        accent: 'blue',
        category: 'medication',
        metadata: { medicationId: id },
      });
    }
  },

  deleteMedication: (id: string): void => {
    const current = medicationService.getMedications();
    const removed = current.find(m => m.id === id);
    const medications = current.filter(m => m.id !== id);
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    if (removed) {
      activityService.logActivity({
        title: 'Medicamento removido',
        description: `${removed.nome} foi removido do estoque.`,
        icon: 'delete',
        accent: 'red',
        category: 'medication',
        metadata: { medicationId: id },
      });
    }
  },

  decreaseStock: (nome: string, quantidade: number, unidade: string): boolean => {
    const medications = medicationService.getMedications();
    const med = medications.find(m => m.nome.toLowerCase() === nome.toLowerCase() && m.unidade === unidade);
    
    if (med && med.quantidade >= quantidade) {
      med.quantidade -= quantidade;
      localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
      activityService.logActivity({
        title: 'Estoque consumido',
        description: `${quantidade} ${unidade} foram baixados de ${med.nome}.`,
        icon: 'inventory_2',
        accent: 'violet',
        category: 'medication',
        metadata: { medicationId: med.id },
      });
      return true;
    }
    return false;
  },

  increaseStock: (id: string, quantityToAdd: number): boolean => {
    const medications = medicationService.getMedications();
    const med = medications.find(item => item.id === id);

    if (!med || quantityToAdd <= 0) {
      return false;
    }

    med.quantidade += quantityToAdd;
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    activityService.logActivity({
      title: 'Estoque reforçado',
      description: `${quantityToAdd} ${med.unidade} adicionados em ${med.nome}.`,
      icon: 'add_circle',
      accent: 'emerald',
      category: 'medication',
      metadata: { medicationId: med.id },
    });
    return true;
  },

  getLowStockMedications: (): Medication[] => {
    return medicationService.getMedications().filter(m => m.quantidade <= m.limiteEstoque);
  }
};
