
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

  const severityColors = {
    low: 'border-blue-500',
    medium: 'border-yellow-500',
    high: 'border-red-500'
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Alertas</h2>
        <p className="text-gray-500 text-sm">Notificações importantes sobre sua saúde e assinatura.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
            <div className="p-10 text-center uppercase tracking-widest text-xs font-bold opacity-50">Sincronizando alertas...</div>
        ) : alerts.length === 0 ? (
            <div className="p-10 text-center uppercase tracking-widest text-xs font-bold text-gray-500">Nenhum alerta no momento.</div>
        ) : alerts.map(alert => (
          <div key={alert.id} className={`bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 border-l-8 ${severityColors[alert.severity]} p-6 flex items-start justify-between`}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{alert.date}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 ${alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                  Prioridade {alert.severity}
                </span>
              </div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">{alert.title}</h3>
              <p className="text-sm text-gray-400 max-w-xl">{alert.description}</p>
            </div>
            <button className="text-xs font-bold uppercase text-gray-500 hover:text-white transition-colors">Marcar como lido</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
