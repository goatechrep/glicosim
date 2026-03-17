
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
    <aside className="sticky top-0 z-[30] h-screen w-full overflow-hidden bg-white dark:bg-[#111121] flex flex-col border-r border-slate-200 dark:border-slate-800/60 p-6 [@media(max-height:860px)]:p-5 [@media(max-height:760px)]:p-4">
      <div className="shrink-0 px-2 py-8 flex items-center gap-3 mb-8 [@media(max-height:860px)]:py-5 [@media(max-height:860px)]:mb-5 [@media(max-height:760px)]:py-3 [@media(max-height:760px)]:mb-4">
        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0 [@media(max-height:760px)]:w-9 [@media(max-height:760px)]:h-9">
          <span className="material-symbols-outlined text-white text-[24px] font-bold">bloodtype</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-slate-900 dark:text-white leading-none [@media(max-height:760px)]:text-lg">Glico<span className="text-orange-600">SIM</span></h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1 [@media(max-height:760px)]:hidden">Sua glicemia em dia!</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-1 pr-2">
          <p className="px-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.25em] mb-6 [@media(max-height:860px)]:mb-4 [@media(max-height:760px)]:mb-3">Menu de Controle</p>
          <nav className="space-y-2 [@media(max-height:760px)]:space-y-1.5" aria-label="Menu principal">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-w-0 items-center gap-4 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 [@media(max-height:860px)]:py-3 [@media(max-height:860px)]:text-[13px] [@media(max-height:760px)]:gap-3 [@media(max-height:760px)]:px-3.5 [@media(max-height:760px)]:py-2.5 [@media(max-height:760px)]:text-[12px]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${isActive
                    ? 'bg-transparent text-orange-600 dark:text-orange-400 active'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`
                }
                aria-current={item.path === '/' ? 'page' : undefined}
              >
                <span className="material-symbols-outlined shrink-0 text-[22px] [@media(max-height:760px)]:text-[20px]" aria-hidden="true">{item.icon}</span>
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-4 shrink-0 [@media(max-height:860px)]:mt-3 [@media(max-height:760px)]:mt-2">
          {/* Banner Upgrade PRO */}
          {user?.plano !== 'PRO' && (() => {
            const proPlan = getPlanById('PRO');
            return (
            <div
              className="hidden md:block bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform [@media(max-height:860px)]:p-4 [@media(max-height:760px)]:p-3 [@media(max-height:700px)]:hidden"
              onClick={() => window.location.hash = '#/pro'}
            >
              <div className="relative z-10 text-center">
                <h3 className="text-[22px] font-black uppercase mb-1 [@media(max-height:860px)]:text-lg [@media(max-height:760px)]:text-base">Atualize para {proPlan?.nome}</h3>
                <p className="text-orange-100 text-[10px] mb-3 [@media(max-height:760px)]:hidden">{proPlan?.descricao}</p>
                <div className="flex items-baseline justify-center gap-1 mb-3 [@media(max-height:760px)]:mb-2">
                  <span className="text-2xl font-black [@media(max-height:860px)]:text-xl [@media(max-height:760px)]:text-lg">{getFormattedPrice(proPlan!)}</span>
                  <span className="text-orange-200 text-xs [@media(max-height:760px)]:text-[10px]">/{proPlan?.periodo}</span>
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 font-black text-[10px] uppercase rounded-lg hover:bg-orange-50 transition-all [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:py-1.5">
                    <span>Conhecer Plano PRO</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </div>
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
        </div>
      </div>

      <div className="mt-auto shrink-0 pt-4 border-t border-slate-100 dark:border-slate-800/80 [@media(max-height:760px)]:pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 [@media(max-height:760px)]:py-2 [@media(max-height:760px)]:text-[10px]"
          aria-label="Sair da aplicação"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
          Sair do App
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
