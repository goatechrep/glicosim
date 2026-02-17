
import React, { useState } from 'react';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { PlanoType } from '../types';

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (data: any) => {
    setLoading(true);
    await mockService.updateUser(data);
    await refreshUser();
    setLoading(false);
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    await mockService.updateUser({ theme });
    await refreshUser();
    setLoading(false);
  };

  const handleReset = async () => {
    if (window.confirm('Isso apagará TODOS os seus dados permanentemente. Continuar?')) {
      await mockService.resetData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Ajustes</h2>
        <p className="text-gray-500 text-sm">Configure sua conta e preferências.</p>
      </header>

      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 overflow-x-auto">
        {['perfil', 'assinatura', 'sistema'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
          </button>
        ))}
      </div>

      <div className="max-w-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
        {activeTab === 'perfil' && (
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleUpdate({}); }}>
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl font-black italic">
                {user?.nome?.[0] || 'U'}
              </div>
              <div>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">Alterar Foto</button>
                <p className="text-[10px] text-gray-500 uppercase mt-1">PNG, JPG ou GIF. Máx 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome</label>
                <input 
                  type="text" 
                  defaultValue={user?.nome} 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">E-mail</label>
                <input 
                  type="email" 
                  defaultValue={user?.email} 
                  disabled
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm opacity-50 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Peso (kg)</label>
                <input type="number" defaultValue={user?.peso || 70} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Altura (cm)</label>
                <input type="number" defaultValue={user?.altura || 175} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm" />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">WhatsApp</label>
                <input type="text" placeholder="(00) 00000-0000" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'SALVANDO...' : 'SALVAR PERFIL'}
            </button>
          </form>
        )}

        {activeTab === 'assinatura' && (
          <div className="space-y-8">
            <div className="p-6 bg-blue-600/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Seu Plano Atual</p>
                <p className="text-3xl font-black italic tracking-tighter uppercase">{user?.plano}</p>
              </div>
              {user?.plano === PlanoType.FREE && (
                <button className="px-6 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors">UPGRADE PRO</button>
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Planos Disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 border transition-colors ${user?.plano === PlanoType.FREE ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-gray-50 dark:bg-gray-900/20'}`}>
                  <p className="font-black italic text-xl uppercase">GRATUITO</p>
                  <p className="text-3xl font-black mt-2">R$ 0<span className="text-xs">/mês</span></p>
                  <ul className="mt-4 space-y-2 text-xs text-gray-400">
                    <li>✓ Registros ilimitados</li>
                    <li>✓ Gráficos básicos</li>
                    <li>✓ Exportação CSV</li>
                  </ul>
                </div>
                <div className={`p-6 border transition-colors ${user?.plano === PlanoType.PRO ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 bg-gray-50 dark:bg-gray-900/20'}`}>
                  <p className="font-black italic text-xl uppercase text-blue-500">PRO PREMIUM</p>
                  <p className="text-3xl font-black mt-2">R$ 19,90<span className="text-xs">/mês</span></p>
                  <ul className="mt-4 space-y-2 text-xs text-gray-400">
                    <li>✓ Tudo do Free</li>
                    <li>✓ IA Preditiva de Glicemia</li>
                    <li>✓ Relatórios PDF para Médico</li>
                    <li>✓ Alertas via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Histórico de Pagamentos</h4>
              <div className="border border-gray-800 text-[10px] font-bold">
                <div className="grid grid-cols-3 bg-gray-900/50 p-2 uppercase tracking-widest border-b border-gray-800">
                  <span>Data</span>
                  <span>Valor</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="p-2 grid grid-cols-3 border-b border-gray-800">
                  <span>01/11/2023</span>
                  <span>R$ 0,00</span>
                  <span className="text-right text-green-500 uppercase">PAGO</span>
                </div>
                <div className="p-2 grid grid-cols-3">
                  <span>01/10/2023</span>
                  <span>R$ 0,00</span>
                  <span className="text-right text-green-500 uppercase">PAGO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="space-y-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Preferências Visuais</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Claro' },
                  { id: 'dark', label: 'Escuro' },
                  { id: 'system', label: 'Sistema' }
                ].map(mode => (
                  <button 
                    key={mode.id} 
                    onClick={() => handleThemeChange(mode.id as any)}
                    className={`py-4 border text-[10px] font-black uppercase tracking-widest transition-all ${
                      user?.theme === mode.id 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notificações</h4>
              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800">
                <span className="text-xs font-bold uppercase tracking-widest">Alertas via E-mail</span>
                <button 
                  onClick={() => handleUpdate({ notifications: !user?.notifications })}
                  className={`w-10 h-5 relative transition-colors ${user?.notifications ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white transition-all ${user?.notifications ? 'left-5.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Alertas via WhatsApp (PRO)</span>
                <div className="w-10 h-5 bg-gray-800/50 cursor-not-allowed"></div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-800 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Zona de Perigo</h4>
              <div className="flex flex-col gap-3">
                <button onClick={handleReset} className="w-full py-4 border border-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-900/10 transition-colors">
                  RESETAR TODOS OS DADOS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
