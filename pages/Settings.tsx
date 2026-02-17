
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

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil' },
    { id: 'assinatura', label: 'Assinatura' },
    { id: 'sistema', label: 'Sistema' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu perfil e preferências do sistema.</p>
        </div>
      </header>

      {/* Standardized Tabs System matching Login.tsx */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl pt-2">
        {activeTab === 'perfil' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-8 animate-slide-up">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl font-black text-orange-600 border border-orange-100 dark:border-orange-900/30">
                {user?.nome?.[0] || 'U'}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">Foto de Perfil</h4>
                <div className="flex gap-4">
                  <button className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline">Alterar</button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500">Remover</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputShadcn label="Nome Completo" defaultValue={user?.nome} />
              <InputShadcn label="E-mail" defaultValue={user?.email} disabled />
              <InputShadcn label="WhatsApp" placeholder="(00) 00000-0000" />
              <InputShadcn label="Data de Nascimento" type="date" />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleUpdate({})}
                className="px-8 py-3 bg-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
              >
                {loading ? 'Processando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'assinatura' && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-orange-600 p-10 rounded-3xl relative overflow-hidden text-white shadow-xl shadow-orange-500/20">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Plano Atual</p>
                  <h3 className="text-4xl font-black tracking-tighter uppercase italic">{user?.plano} PRO</h3>
                  <p className="text-orange-200 text-xs mt-3 opacity-90 max-w-xs leading-relaxed">Sua assinatura está ativa e configurada para renovação automática em Outubro.</p>
                </div>
                <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg">Gerenciar Assinatura</button>
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-400/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FeatureCard title="IA Predictor" icon="bolt" description="Previsão de picos" />
               <FeatureCard title="Relatórios PDF" icon="description" description="Exportação completa" />
               <FeatureCard title="Suporte 24h" icon="support_agent" description="Atendimento VIP" />
            </div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-10 animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600 text-lg">palette</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aparência da Interface</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Light', 'Dark', 'System'].map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => handleThemeChange(mode.toLowerCase() as any)}
                    className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 ${
                      user?.theme === mode.toLowerCase() 
                        ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 shadow-sm' 
                        : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {mode === 'Light' ? 'light_mode' : mode === 'Dark' ? 'dark_mode' : 'settings_brightness'}
                    </span>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-red-500">
                  <span className="material-symbols-outlined text-lg">dangerous</span>
                  <h4 className="text-sm font-bold uppercase tracking-tight">Zona de Perigo</h4>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed max-w-sm">Uma vez que você exclui sua conta, não há volta. Por favor, tenha certeza.</p>
               <button className="px-6 py-3 border-2 border-red-100 dark:border-red-900/30 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                 Excluir Conta Permanentemente
               </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const InputShadcn = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600 transition-all dark:text-white disabled:opacity-50"
      {...props}
    />
  </div>
);

const FeatureCard = ({ title, icon, description }: any) => (
  <div className="bg-white dark:bg-[#111121] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition-all group">
    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-orange-600 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 rounded-xl flex items-center justify-center transition-all mb-1">
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</span>
    <span className="text-[9px] text-slate-400 font-medium">{description}</span>
  </div>
);

export default SettingsPage;
