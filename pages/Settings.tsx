
import React, { useState } from 'react';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { PlanoType } from '../types';

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);

  // States for new physical profile fields
  const [peso, setPeso] = useState<string>(user?.peso?.toString() || '');
  const [altura, setAltura] = useState<string>(user?.altura?.toString() || '');
  const [biotipo, setBiotipo] = useState<string>(user?.biotipo || 'Mesomorfo');

  const handleUpdate = async () => {
    setLoading(true);
    await mockService.updateUser({ 
      peso: peso ? parseFloat(peso) : undefined, 
      altura: altura ? parseFloat(altura) : undefined,
      biotipo 
    });
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Configurações</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu perfil sem itálicos.</p>
        </div>
      </header>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-slate-700 text-orange-600' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl pt-2">
        {activeTab === 'perfil' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl space-y-10 animate-slide-up">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl font-black text-orange-600 border border-orange-100 dark:border-orange-900/30">
                {user?.nome?.[0] || 'U'}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">Informações Básicas</h4>
                <div className="flex gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {user?.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputShadcn label="Nome Completo" defaultValue={user?.nome} />
              <InputShadcn label="E-mail" defaultValue={user?.email} disabled />
              
              {/* Novos campos de perfil físico */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peso (kg)</label>
                <input 
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 75.5"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none dark:text-white focus:ring-2 focus:ring-orange-600/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Altura (cm)</label>
                <input 
                  type="number"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  placeholder="Ex: 175"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none dark:text-white focus:ring-2 focus:ring-orange-600/10 transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biotipo Físico (Plano de Treino)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Ectomorfo', 'Mesomorfo', 'Endomorfo'].map(type => (
                    <button
                      key={type}
                      onClick={() => setBiotipo(type)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        biotipo === type 
                        ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-950/20' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 font-medium px-1 mt-2 uppercase tracking-tighter">Essa informação será a base para seu futuro plano de exercícios.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="px-10 py-4 bg-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Sincronizando...' : 'Salvar Perfil Completo'}
              </button>
            </div>
          </div>
        )}

        {/* Assinatura and Sistema tabs follow the previous layout but ensure no italics */}
        {activeTab === 'assinatura' && (
          <div className="bg-orange-600 p-12 rounded-[2.5rem] relative overflow-hidden text-white animate-slide-up">
            <h3 className="text-4xl font-black tracking-tighter uppercase relative z-10">{user?.plano} PRO</h3>
            <p className="text-orange-100 text-sm mt-4 opacity-90 max-w-sm leading-relaxed relative z-10">Sua assinatura está ativa. Aproveite o acesso completo sem itálicos.</p>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-10 rounded-4xl animate-slide-up">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-6 tracking-widest">Temas do Sistema</h4>
            <div className="grid grid-cols-3 gap-6">
              {['Light', 'Dark', 'System'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => handleThemeChange(mode.toLowerCase() as any)}
                  className={`py-6 border-2 rounded-3xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-3 ${
                    user?.theme === mode.toLowerCase() 
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/20 text-orange-600' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{mode === 'Light' ? 'light_mode' : mode === 'Dark' ? 'dark_mode' : 'settings_brightness'}</span>
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const InputShadcn = ({ label, disabled, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      disabled={disabled}
      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-600/10 transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    />
  </div>
);

export default SettingsPage;
