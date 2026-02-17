
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
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
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
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-950 dark:text-slate-50 transition-colors duration-200">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={
              <OnboardingCheck>
                <OnboardingPage />
              </OnboardingCheck>
            } />
            <Route path="/*" element={
              <PrivateRoute>
                <div className="flex flex-col md:flex-row h-screen overflow-hidden">
                  {/* Desktop Sidebar */}
                  <div className="hidden md:block">
                    <Sidebar />
                  </div>

                  {/* Mobile Top Header */}
                  <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09090b] z-50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-600 font-bold text-2xl">bloodtype</span>
                      <span className="font-bold text-lg tracking-tight">GlicoSIM</span>
                    </div>
                    <NavLink to="/ajustes" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                      <span className="material-symbols-outlined text-slate-500">account_circle</span>
                    </NavLink>
                  </div>

                  <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-4 md:p-8 w-full max-w-[1400px] mx-auto">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/registros" element={<RecordsPage />} />
                      <Route path="/alertas" element={<AlertsPage />} />
                      <Route path="/ajustes" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>

                  {/* Mobile Bottom Navigation */}
                  <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-50">
                    <MobileNavItem to="/" icon="home" label="Início" />
                    <MobileNavItem to="/registros" icon="analytics" label="Registros" />
                    <MobileNavItem to="/alertas" icon="notifications" label="Alertas" />
                    <MobileNavItem to="/ajustes" icon="settings" label="Ajustes" />
                  </nav>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

const MobileNavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-orange-600 active' : 'text-slate-400'}`
    }
  >
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
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
