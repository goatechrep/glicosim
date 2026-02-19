
import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { Alert } from '../types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'medium' as 'low' | 'medium' | 'high' });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const stats = await mockService.getDashboardStats();
    setAlerts(stats.alerts);
    setLoading(false);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  const handleClearAll = async () => {
    if (confirm('Deseja limpar todos os alertas?')) {
      for (const alert of alerts) {
        await mockService.deleteAlert(alert.id);
      }
      addToast('Todos os alertas foram removidos!');
      await loadAlerts();
    }
  };

  const handleDelete = async (id: string) => {
    await mockService.deleteAlert(id);
    addToast('Alerta removido!');
    await loadAlerts();
  };

  const handleEdit = (alert: Alert) => {
    setEditingId(alert.id);
    setFormData({ title: alert.title, description: alert.description, severity: alert.severity });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await mockService.updateAlert(editingId, formData);
      addToast('Alerta atualizado!');
    }
    setIsModalOpen(false);
    setEditingId(null);
    await loadAlerts();
  };

  const severityStyles = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
    medium: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-100 dark:border-orange-900/30',
    high: 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100 dark:border-red-900/30'
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[10999] bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-none" />
      )}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[11000] pointer-events-none flex flex-col items-center justify-center gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 text-center min-w-[280px] animate-toast-in backdrop-blur-sm shadow-2xl ${
            t.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700 text-white' : 
            t.type === 'error' ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white' : 
            'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700 text-white'
          }`}>
            <span className="material-symbols-outlined text-5xl font-bold">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
            <span className="text-sm font-black uppercase tracking-wider">{t.message}</span>
          </div>
        ))}
      </div>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-orange-600 dark:text-white uppercase leading-none">Notificações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Alertas inteligentes sobre sua saúde.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const testNotifications = [
                { title: 'Glicemia Alta', description: 'Sua glicemia está acima de 180 mg/dL', severity: 'high' as const },
                { title: 'Lembrete de Medicação', description: 'Hora de tomar sua insulina', severity: 'medium' as const },
                { title: 'Estoque Baixo', description: 'Medicamento com estoque baixo', severity: 'low' as const }
              ];
              const random = testNotifications[Math.floor(Math.random() * testNotifications.length)];
              addToast(`Teste: ${random.title}`, 'info');
            }}
            className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            Testar Notificação
          </button>
          <button onClick={handleClearAll} className="text-[10px] font-black text-orange-600 uppercase tracking-widest px-5 py-2.5 border-2 border-orange-100 dark:border-orange-900/30 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all active:scale-95">
            Limpar Painel
          </button>
        </div>
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
                <button onClick={() => handleEdit(alert)} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Editar</button>
                <button onClick={() => handleDelete(alert.id)} className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-6">
          <div className="w-full max-w-lg bg-white dark:bg-[#111121] rounded-lg overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Editar Alerta</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:text-red-500">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white resize-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severidade</label>
                <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[12px] uppercase rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-black text-[12px] uppercase rounded-xl hover:bg-orange-700 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in { 0% { opacity: 0; transform: scale(0.6) translateY(50px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1.3) forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AlertsPage;
