
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
    medium: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-100 dark:border-orange-900/30',
    high: 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100 dark:border-red-900/30'
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white italic uppercase">Central de Alertas</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Notificações inteligentes sobre sua saúde e assinatura.</p>
        </div>
        <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest px-6 py-3 border-2 border-orange-100 dark:border-orange-900/30 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all active:scale-95">
          Limpar Notificações
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white dark:bg-[#111121] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-4xl p-24 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Nenhuma notificação por enquanto</p>
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800/80 p-8 rounded-4xl flex flex-col md:flex-row items-start gap-8 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 border-2 ${severityStyles[alert.severity]} transition-transform group-hover:rotate-3`}>
              <span className="material-symbols-outlined text-[28px]">
                {alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'notifications_active'}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors uppercase tracking-tight">{alert.title}</h3>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{alert.date}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{alert.description}</p>
              <div className="flex flex-wrap gap-3 pt-4">
                <button className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Ignorar</button>
                <button className="px-6 py-2.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all active:scale-95">Ver mais Detalhes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
