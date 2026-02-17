
export enum Periodo {
  CAFE_MANHA = 'Café da Manhã',
  ALMOCO = 'Almoço',
  LANCHE = 'Lanche',
  JANTAR = 'Jantar',
  GLICEMIA_DEITAR = 'Glicemia ao Deitar'
}

export enum Medicamento {
  HUMALOG = 'Humalog',
  BASAL = 'Basal',
  METFORMINA = 'Metformina',
  NENHUM = 'Nenhum'
}

export enum PlanoType {
  FREE = 'FREE',
  PRO = 'PRO'
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  dataNascimento?: string;
  peso?: number;
  altura?: number;
  biotipo?: string;
  localizacao?: string;
  foto?: string;
  plano: PlanoType;
  isOnboarded: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

export interface GlucoseRecord {
  id: string;
  userId: string;
  periodo: Periodo;
  medicamento: Medicamento;
  antesRefeicao: number;
  aposRefeicao?: number;
  dose: string;
  notes: string;
  data: string;
  timestamp: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
  plan: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}
