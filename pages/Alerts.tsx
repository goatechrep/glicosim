
import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { Alert } from '../types';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const stats = await mockService.getDashboardStats();
      setAlerts(stats.alerts);
      setLoading(false);
    };
    fetch();
  }, []);

  const severityStyles = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700',
    medium: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-orange-100 dark:border-orange-900/20',
    high: 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-100 dark:border-red-900/20'
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notificações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Fique por dentro dos alertas importantes do GlicoSIM.</p>
        </div>
        <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors px-3 py-1 border border-orange-100 dark:border-orange-900/30 rounded-md">Limpar Histórico</button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center font-medium text-slate-400">Carregando notificações...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">notifications_off</span>
            <p className="text-slate-500 font-medium">Tudo limpo por aqui!</p>
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${severityStyles[alert.severity]}`}>
              <span className="material-symbols-outlined text-[20px]">
                {alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{alert.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{alert.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{alert.description}</p>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Marcar como lida</button>
                <button className="px-4 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-100 dark:border-orange-900/30 text-[10px] font-bold uppercase rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">Ver Detalhes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
