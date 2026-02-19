
import React, { useState } from 'react';

const UpdatesPage: React.FC = () => {
  const [serviceStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  const updates = [
    {
      version: 'v1.5.0',
      date: '2024-01-15',
      type: 'feature',
      title: 'Central de Ajuda e Guias',
      changes: [
        'Adicionado guia completo de aplicação de insulina',
        'Criado guia de gerenciamento de medicamentos',
        'Layout otimizado para mobile',
        'Navegação por parâmetros de URL'
      ]
    },
    {
      version: 'v1.4.0',
      date: '2024-01-14',
      type: 'feature',
      title: 'Plano PRO e Melhorias',
      changes: [
        'Página do Plano PRO com vantagens detalhadas',
        'Banner de upgrade no Dashboard',
        'Sincronização em nuvem para usuários PRO',
        'Remoção de propagandas no plano PRO'
      ]
    },
    {
      version: 'v1.3.0',
      date: '2024-01-13',
      type: 'improvement',
      title: 'Correções de UX',
      changes: [
        'Cards de registro com layout melhorado',
        'Limitação de 3 dígitos nos inputs de glicemia',
        'Alertas movidos para onBlur',
        'Botões de ação fixados e visíveis',
        'Checkbox "Criar alerta" funcional'
      ]
    },
    {
      version: 'v1.2.0',
      date: '2024-01-12',
      type: 'feature',
      title: 'Sistema de Medicamentos',
      changes: [
        'Inventário completo de medicamentos',
        'Desconto automático de estoque',
        'Alertas de estoque baixo',
        'Integração com registros de glicemia'
      ]
    },
    {
      version: 'v1.1.0',
      date: '2024-01-11',
      type: 'feature',
      title: 'Lembretes e Validações',
      changes: [
        'Sistema de lembretes 2h após refeição',
        'Validação de glicemia com alertas de emergência',
        'Configurações personalizáveis de limites',
        'Modal automático para lembretes pendentes'
      ]
    },
    {
      version: 'v1.0.0',
      date: '2024-01-10',
      type: 'release',
      title: 'Lançamento Inicial',
      changes: [
        'Dashboard com estatísticas',
        'Registro de glicemia',
        'Gráfico de tendências',
        'Sistema de alertas',
        'Tema claro e escuro'
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'improvement': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'fix': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'release': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return 'Nova Funcionalidade';
      case 'improvement': return 'Melhoria';
      case 'fix': return 'Correção';
      case 'release': return 'Lançamento';
      default: return 'Atualização';
    }
  };

  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'operational': return 'bg-emerald-500';
      case 'degraded': return 'bg-amber-500';
      case 'down': return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (serviceStatus) {
      case 'operational': return 'Todos os sistemas operacionais';
      case 'degraded': return 'Desempenho degradado';
      case 'down': return 'Serviço indisponível';
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 md:pb-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-purple-600 text-2xl">update</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Atualizações e Novidades</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Acompanhe as melhorias do GlicoSIM</p>
        </div>
      </div>

      {/* Status do Serviço */}
      <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Status do Serviço</h2>
          <a 
            href="https://status.glicosim.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Ver Detalhes
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{getStatusText()}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['API', 'Banco de Dados', 'Sincronização', 'Notificações'].map((service) => (
            <div key={service} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{service}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Operacional</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline de Atualizações */}
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div key={index} className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getTypeColor(update.type)}`}>
                  {getTypeLabel(update.type)}
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{update.version}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {new Date(update.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">{update.title}</h3>
            <ul className="space-y-2">
              {update.changes.map((change, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-start gap-4 mb-4">
          <span className="material-symbols-outlined text-3xl">rocket_launch</span>
          <div>
            <h2 className="text-xl font-black mb-2">Próximas Funcionalidades</h2>
            <p className="text-purple-100 text-sm mb-4">O que está por vir no GlicoSIM</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-purple-200">✓</span>
            <span>Integração com dispositivos de monitoramento contínuo</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-200">✓</span>
            <span>Relatórios em PDF personalizados</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-200">✓</span>
            <span>Compartilhamento de dados com médicos</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-200">✓</span>
            <span>Aplicativo mobile nativo (iOS e Android)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UpdatesPage;
