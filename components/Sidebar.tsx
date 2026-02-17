
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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/registros', label: 'Registros', icon: '📝' },
    { path: '/alertas', label: 'Alertas', icon: '🔔' },
    { path: '/ajustes', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#111] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">GlicoSIM</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Health Control</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium border-none transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto hidden md:block">
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-none flex items-center justify-center text-lg">
            {user?.nome?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.nome}</p>
            <p className="text-xs text-gray-500 truncate">{user?.plano} Plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-none font-medium"
        >
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
