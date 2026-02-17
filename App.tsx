
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { UserProfile } from './types';
import { mockService } from './services/mockService';

// Pages
import LoginPage from './pages/Login';
import OnboardingPage from './pages/Onboarding';
import DashboardPage from './pages/Dashboard';
import RecordsPage from './pages/Records';
import SettingsPage from './pages/Settings';
import AlertsPage from './pages/Alerts';

// Components
import Sidebar from './components/Sidebar';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (userData: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = await mockService.getUser();
      setUser(storedUser);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) {
      document.documentElement.classList.add('dark');
      return;
    }
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
      }
    };
    applyTheme(user.theme);
  }, [user?.theme]);

  const login = async (userData: Partial<UserProfile>) => {
    const newUser = await mockService.createUser(userData);
    setUser(newUser);
  };

  const logout = () => {
    mockService.deleteUser();
    setUser(null);
  };

  const refreshUser = async () => {
    const updatedUser = await mockService.getUser();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#111121]">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (!user.isOnboarded) return <Navigate to="/onboarding" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-white dark:bg-[#111121] text-slate-950 dark:text-slate-50 overflow-hidden">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={
              <OnboardingCheck>
                <OnboardingPage />
              </OnboardingCheck>
            } />
            <Route path="/*" element={
              <PrivateRoute>
                <div className="flex h-screen overflow-hidden">
                  {/* Desktop Sidebar */}
                  <div className="hidden md:block">
                    <Sidebar />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile Top Header */}
                    <div className="md:hidden flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-[#111121]/80 backdrop-blur-xl z-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center rotate-3">
                          <span className="material-symbols-outlined text-white text-[18px] font-bold">bloodtype</span>
                        </div>
                        <span className="font-black text-base tracking-tighter italic uppercase">GlicoSIM</span>
                      </div>
                      <NavLink to="/ajustes" className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 transition-all active:scale-90">
                        <span className="material-symbols-outlined text-slate-500 text-[20px]">person</span>
                      </NavLink>
                    </div>

                    <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 custom-scrollbar">
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/registros" element={<RecordsPage />} />
                        <Route path="/alertas" element={<AlertsPage />} />
                        <Route path="/ajustes" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <nav className="md:hidden sticky bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-[#111121]/90 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-around px-4 z-50 pb-2">
                      <MobileNavItem to="/" icon="home" label="Início" />
                      <MobileNavItem to="/registros" icon="analytics" label="Histórico" />
                      <MobileNavItem to="/alertas" icon="notifications" label="Alertas" />
                      <MobileNavItem to="/ajustes" icon="settings" label="Ajustes" />
                    </nav>
                  </div>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </AuthProvider>
  );
};

const MobileNavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex flex-col items-center gap-1.5 transition-all px-4 py-2 rounded-2xl ${isActive ? 'text-orange-600 bg-orange-50/50 dark:bg-orange-950/20 active' : 'text-slate-400'}`
    }
  >
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </NavLink>
);

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.isOnboarded) return <Navigate to="/" />;
  return <>{children}</>;
}

export default App;
