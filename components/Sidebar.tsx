
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
    <aside className="w-64 h-full bg-white dark:bg-[#09090b] flex flex-col border-r border-slate-200 dark:border-slate-800">
      <div className="px-6 py-10 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[22px] font-bold">bloodtype</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">GlicoSIM</h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-1">Premium Monitor</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 active'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
              {user?.nome?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.nome}</p>
              <p className="text-[10px] text-slate-500 truncate lowercase">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Encerrar Sessão
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
