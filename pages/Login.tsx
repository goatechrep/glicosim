
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@glicosim.com');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulação de delay de rede
    await new Promise(r => setTimeout(r, 800));
    
    const userData = { 
      nome: activeTab === 'login' ? email.split('@')[0] : name, 
      email,
      isOnboarded: activeTab === 'login' // Usuários novos (register) vão para o onboarding
    };
    
    await login(userData);
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111121] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20 transform rotate-3">
              <span className="material-symbols-outlined text-white text-4xl">bloodtype</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">GlicoSIM</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Controle inteligente para uma vida plena.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {/* Custom Shadcn-like Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'login' 
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'register' 
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="px-6 pb-6 pt-2">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {activeTab === 'register' && (
                <div className="space-y-1.5 animate-slide-up">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                   <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="João da Silva"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                      />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">alternate_email</span>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Senha</label>
                    {activeTab === 'login' && (
                      <button type="button" className="text-[10px] font-bold text-orange-600 hover:underline">Esqueceu sua senha?</button>
                    )}
                 </div>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                    <input 
                      type="password" 
                      required 
                      defaultValue="123456"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 mt-4"
              >
                {isLoading 
                  ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AGUARDE...</span> 
                  : activeTab === 'login' ? 'Acessar Painel' : 'Criar minha Conta'
                }
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium px-6">
          Leia nossos <span className="text-slate-600 dark:text-slate-300 underline cursor-pointer">Termos de Uso</span> e <span className="text-slate-600 dark:text-slate-300 underline cursor-pointer">Política de Privacidade</span>.
        </p>
      </div>
      
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LoginPage;
