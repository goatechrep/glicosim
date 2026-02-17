
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

  // Theme management
  useEffect(() => {
    if (!user) {
      document.documentElement.classList.add('dark'); // Default to dark if no user
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
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Carregando GlicoSIM...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.isOnboarded) return <Navigate to="/onboarding" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-200">
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
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1200px] mx-auto w-full">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/registros" element={<RecordsPage />} />
                      <Route path="/alertas" element={<AlertsPage />} />
                      <Route path="/ajustes" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.isOnboarded) return <Navigate to="/" />;
  return <>{children}</>;
}

export default App;
