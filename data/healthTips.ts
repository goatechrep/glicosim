export interface HealthTipArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: 'hidratacao' | 'alimentacao' | 'atividade' | 'monitoramento' | 'bem-estar';
  publishedAt: string;
  featured?: boolean;
}

export const HEALTH_TIPS_DATA: HealthTipArticle[] = [
  {
    id: 'tip-1',
    slug: 'hidratacao-correta-no-dia-a-dia',
    title: 'Hidratação Correta no Dia a Dia',
    summary: 'Beba mais água para ter uma vida saudável. Saiba como montar sua rotina de hidratação.',
    content:
      'Manter uma rotina de hidratação ajuda no controle geral da saúde e no bem-estar. Ao longo do dia, beba água em pequenas quantidades, observando sede, clima e atividade física.',
    category: 'hidratacao',
    publishedAt: '2026-02-28',
    featured: true
  },
  {
    id: 'tip-2',
    slug: 'organizacao-das-refeicoes',
    title: 'Organização das Refeições',
    summary: 'Planejar horários e porções ajuda a reduzir variações bruscas nos níveis de glicemia.',
    content:
      'Organize refeições em horários consistentes, priorize alimentos in natura e mantenha acompanhamento profissional para ajustes individualizados.',
    category: 'alimentacao',
    publishedAt: '2026-02-20'
  },
  {
    id: 'tip-3',
    slug: 'atividade-fisica-com-seguranca',
    title: 'Atividade Física com Segurança',
    summary: 'Movimento regular melhora condicionamento e pode apoiar seu controle metabólico.',
    content:
      'Comece com intensidade leve a moderada, monitore sintomas e siga orientação médica para práticas mais intensas.',
    category: 'atividade',
    publishedAt: '2026-02-15'
  }
];
