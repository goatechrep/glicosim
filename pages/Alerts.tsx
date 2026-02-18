
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
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
    medium: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-100 dark:border-orange-900/30',
    high: 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100 dark:border-red-900/30'
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Notificações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Alertas inteligentes sobre sua saúde.</p>
        </div>
        <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest px-5 py-2.5 border-2 border-orange-100 dark:border-orange-900/30 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all active:scale-95">
          Limpar Painel
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48">
             <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">Sincronizando...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white dark:bg-[#111121] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">notifications_off</span>
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Nenhuma notificação por enquanto</p>
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800/80 p-5 rounded-3xl flex items-start gap-5 hover:border-orange-200 dark:hover:border-orange-900/30 transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${severityStyles[alert.severity]} transition-transform group-hover:scale-105`}>
              <span className="material-symbols-outlined text-[24px]">
                {alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'notifications_active'}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">{alert.title}</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">{alert.date.split('-').reverse().slice(0,2).join('/')}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium pr-4">{alert.description}</p>
              <div className="flex gap-2 pt-3">
                <button className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Ignorar</button>
                <button className="px-4 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-700 transition-all active:scale-95">Resolver</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
