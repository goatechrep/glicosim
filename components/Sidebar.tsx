
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

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
    { path: '/alertas', label: 'Notificações', icon: 'notifications' },
    { path: '/ajustes', label: 'Configurações', icon: 'settings' },
  ];

  return (
    <aside className="w-72 h-full bg-white dark:bg-[#111121] flex flex-col border-r border-slate-200 dark:border-slate-800/60 p-6">
      <div className="px-2 py-8 flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0">
          <span className="material-symbols-outlined text-white text-[24px] font-bold">bloodtype</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase">GlicoSIM</h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Premium Health</p>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-6">Menu de Controle</p>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 shadow-sm active'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 mb-4 group transition-all hover:border-orange-200 dark:hover:border-orange-900/30">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 font-black text-sm border border-orange-200 dark:border-orange-800 transition-transform group-hover:scale-110">
              {user?.nome?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.nome}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate lowercase tracking-wide">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sair do App
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
