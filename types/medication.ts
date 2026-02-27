export interface Medication {
  id: string;
  nome: string;
  fabricante?: string;
  quantidade: number;
  unidade: 'UI' | 'mg' | 'co' | 'ml';
  limiteEstoque: number;
  createdAt: string;
}
