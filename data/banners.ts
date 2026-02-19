export interface Banner {
  id: string;
  title: string;
  description: string;
  badge?: string;
  buttonText: string;
  buttonLink: string;
  icon: string;
  gradient: string;
  textColor: string;
  enabled: boolean;
}

export const banners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Novo Recurso Disponível!',
    description: 'Agora você pode exportar seus dados e criar backups automáticos',
    badge: 'Novidade',
    buttonText: 'Saiba Mais',
    buttonLink: '#/atualizacoes',
    icon: 'campaign',
    gradient: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-100',
    enabled: true
  },
  {
    id: 'banner-2',
    title: 'Controle Total do Estoque',
    description: 'Gerencie seus medicamentos com alertas inteligentes de estoque baixo',
    badge: 'Destaque',
    buttonText: 'Gerenciar Agora',
    buttonLink: '#/medicamentos',
    icon: 'medication',
    gradient: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-100',
    enabled: true
  },
  {
    id: 'banner-3',
    title: 'Upgrade para PRO',
    description: 'Sincronização na nuvem, sem propagandas e backup automático',
    badge: 'Premium',
    buttonText: 'Ver Planos',
    buttonLink: '#/pro',
    icon: 'workspace_premium',
    gradient: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-100',
    enabled: true
  }
];

export interface BannerConfig {
  dashboard: string[];
  medications: string[];
}

export const bannerConfig: BannerConfig = {
  dashboard: ['banner-1', 'banner-2'],
  medications: ['banner-3', 'banner-2']
};

export const getBannersForPage = (page: keyof BannerConfig): Banner[] => {
  const bannerIds = bannerConfig[page];
  return bannerIds
    .map(id => banners.find(b => b.id === id && b.enabled))
    .filter((b): b is Banner => b !== undefined);
};
