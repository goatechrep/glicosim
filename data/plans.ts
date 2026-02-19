export interface Plan {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  descricao: string;
  recursos: string[];
  cor: string;
  destaque: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const plans: Plan[] = [
  {
    id: 'FREE',
    nome: 'GlicoSIM Free',
    preco: 0,
    periodo: 'Grátis para sempre',
    descricao: 'Grátis para sempre',
    recursos: [
      'Registro de glicemia',
      'Histórico básico',
      'Alertas simples',
      'Controle de medicamentos',
      'Armazenamento local'
    ],
    cor: 'slate',
    destaque: false
  },
  {
    id: 'PRO',
    nome: 'GlicoSIM PRO',
    preco: 49.90,
    periodo: 'Mês',
    descricao: 'Sem ropagandas chatas e limitações!',
    recursos: [
      'Tudo do plano Free',
      'Sincronização na nuvem',
      'Sem propagandas',
      'Backup automático',
      'Acesso multi-dispositivo',
      'Suporte prioritário',
      'Relatórios avançados'
    ],
    cor: 'orange',
    destaque: true,
    stripeProductId: 'prod_glicosim_pro',
    stripePriceId: 'price_glicosim_pro_monthly'
  }
];

export const getPlanById = (id: string): Plan | undefined => {
  return plans.find(plan => plan.id === id);
};

export const getFormattedPrice = (plan: Plan): string => {
  if (plan.preco === 0) return 'Grátis';
  return `R$ ${plan.preco.toFixed(2).replace('.', ',')}`;
};
