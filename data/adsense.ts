export interface AdSenseBlock {
  id: string;
  location: string;
  format: string;
  width: number;
  height: number;
  device: 'mobile' | 'desktop' | 'both';
  description: string;
}

export const adSenseBlocks: AdSenseBlock[] = [
  {
    id: 'dashboard-top',
    location: 'Dashboard - Topo',
    format: '728x90',
    width: 728,
    height: 90,
    device: 'both',
    description: 'Banner horizontal no topo do dashboard'
  },
  {
    id: 'dashboard-before-chart',
    location: 'Dashboard - Antes do Gráfico',
    format: '970x90',
    width: 970,
    height: 90,
    device: 'desktop',
    description: 'Banner largo antes do gráfico de tendência'
  },
  {
    id: 'dashboard-after-activities',
    location: 'Dashboard - Após Atividades',
    format: '970x250',
    width: 970,
    height: 250,
    device: 'desktop',
    description: 'Banner retangular após seção de medicamentos/atividades'
  },
  {
    id: 'sidebar-mobile',
    location: 'Sidebar - Mobile',
    format: '320x100',
    width: 320,
    height: 100,
    device: 'mobile',
    description: 'Banner mobile na sidebar'
  }
];

export const getAdSenseBlock = (id: string): AdSenseBlock | undefined => {
  return adSenseBlocks.find(block => block.id === id);
};
