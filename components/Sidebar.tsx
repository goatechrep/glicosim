
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getPlanById, getFormattedPrice } from '../data/plans';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/registros', label: 'Histórico', icon: 'analytics' },
    { path: '/medicamentos', label: 'Medicamentos', icon: 'medication' },
    { path: '/alertas', label: 'Notificações', icon: 'notifications' },
    { path: '/ajustes', label: 'Configurações', icon: 'settings' },
  ];

  return (
    <aside className="w-72 h-screen bg-white dark:bg-[#111121] flex flex-col border-r border-slate-200 dark:border-slate-800/60 p-6 sticky top-0">
      <div className="px-2 py-8 flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
          <span className="material-symbols-outlined text-white text-[24px] font-bold">bloodtype</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none">Glico<span className="text-orange-600">SIM</span></h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Sua glicemia em dia!</p>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        <p className="px-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.25em] mb-6">Menu de Controle</p>
        <nav className="space-y-2" aria-label="Menu principal">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${isActive
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 active'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`
              }
              aria-current={item.path === '/' ? 'page' : undefined}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Banner Upgrade PRO */}
      {user?.plano !== 'PRO' && (() => {
        const proPlan = getPlanById('PRO');
        return (
        <div className="hidden md:block bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => window.location.hash = '#/pro'}>
          <div className="relative z-10">
            <h3 className="text-lg font-black uppercase mb-1">Atualizar para o {proPlan?.nome}</h3>
            <p className="text-orange-100 text-xs mb-3">Remova propagandas e sincronize na nuvem</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black">{getFormattedPrice(proPlan!)}</span>
              <span className="text-orange-200 text-xs">/{proPlan?.periodo}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 font-black text-[10px] uppercase rounded-lg hover:bg-orange-50 transition-all">
              <span>Conhecer Plano PRO</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        );
      })()}
      {/* Mobile: AdSense ao invés de banner PRO */}
      {user?.plano !== 'PRO' && (
        <div className="md:hidden bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest">Espaço Publicitário - Google AdSense</p>
          <div className="mt-4 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Anúncio 320x100</span>
          </div>
        </div>
      )}

      {/* Perfil fixado no fim da tela */}
      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 group transition-all hover:border-orange-200 dark:hover:border-orange-900/30">
          <div className="flex items-center gap-3 mb-4">
            {user?.foto ? (
              <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900/30">
                <img src={user.foto} alt={user.nome} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 font-black text-sm border border-orange-200 dark:border-orange-800">
                {user?.nome?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.nome || 'Usuário'}</p>
                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${user?.plano === 'PRO' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {user?.plano}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold truncate tracking-wide">Tema: {user?.theme}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            aria-label="Sair da aplicação"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
            Sair do App
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
