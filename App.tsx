
import React, { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { UserProfile } from './types';
import { supabaseService, supabaseClient } from './services/supabaseService';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/Login'));
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const RecordsPage = lazy(() => import('./pages/Records'));
const MedicationsPage = lazy(() => import('./pages/Medications'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const AlertsPage = lazy(() => import('./pages/Alerts'));
const HelpPage = lazy(() => import('./pages/Help'));
const ProPage = lazy(() => import('./pages/Pro'));
const UpdatesPage = lazy(() => import('./pages/Updates'));

// Components
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-white dark:bg-[#111121]">
    <div className="space-y-4 text-center">
      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Carregando...</p>
    </div>
  </div>
);

// Wrapper for Suspense
const LazyPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        console.log('🔍 Verificando sessão inicial...');
        
        // Primeiro tentar carregar do localStorage (offline-first)
        const localUser = localStorage.getItem('glicosim_user');
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            console.log('✅ Usuário carregado do localStorage');
            if (mounted) {
              setUser(userData);
              setLoading(false);
            }
            return;
          } catch (e) {
            localStorage.removeItem('glicosim_user');
          }
        }
        
        // Se não tiver no localStorage, tentar do Supabase
        const { data: { session } } = await supabaseClient!.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('✅ Sessão encontrada:', session.user.id);
          const userProfile = await supabaseService.getUser(session.user.id);
          if (userProfile && mounted) {
            console.log('✅ Perfil carregado do Supabase');
            localStorage.setItem('glicosim_user', JSON.stringify(userProfile));
            setUser(userProfile);
          }
        } else {
          console.log('❌ Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
      } finally {
        if (mounted) {
          console.log('✅ Loading finalizado');
          setLoading(false);
        }
      }
    };

    checkSession();

    // Monitorar mudanças de estado de autenticação do Supabase
    const { data: { subscription } } = supabaseClient!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, 'Session:', !!session);
        
        if (!mounted) return;
        
        if (session?.user) {
          // Usuário autenticado - buscar perfil
          console.log('👤 Buscando perfil do usuário:', session.user.id);
          try {
            const userProfile = await supabaseService.getUser(session.user.id);
            if (!userProfile) {
              // Perfil não existe no banco - deslogar
              console.warn('❌ Perfil do usuário não encontrado. Deslogando...');
              await supabaseService.signOut();
              setUser(null);
              setSessionExpired(true);
            } else {
              console.log('✅ Perfil encontrado:', userProfile.nome, 'Onboarded:', userProfile.isOnboarded);
              localStorage.setItem('glicosim_user', JSON.stringify(userProfile));
              setUser(userProfile);
              setSessionExpired(false);
            }
          } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
            setUser(null);
            setSessionExpired(true);
          }
        } else {
          // Sem sessão
          console.log('🚫 Sem sessão ativa');
          setUser(null);
          setSessionExpired(event === 'SIGNED_OUT');
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  const login = async (email: string, password: string) => {
    await supabaseService.signIn(email, password);
    // o novo usuário será atualizado pelo listener onAuthStateChange
  };

  const logout = () => {
    supabaseService.signOut();
    localStorage.removeItem('glicosim_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await supabaseService.getCurrentUser();
    if (currentUser) {
      const userProfile = await supabaseService.getUser(currentUser.id);
      if (userProfile) {
        localStorage.setItem('glicosim_user', JSON.stringify(userProfile));
        setUser(userProfile);
      } else {
        setUser(null);
        setSessionExpired(true);
      }
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {/* Alerta de sessão expirada */}
      {sessionExpired && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm animate-scale-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                  lock
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">
                Sessão Expirada
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Seus dados não foram encontrados. Por segurança, você foi desconectado. Faça login novamente para continuar.
            </p>

            <button
              onClick={() => {
                setSessionExpired(false);
                window.location.hash = '#/login';
              }}
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
            >
              Ir para Login
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🔒 PrivateRoute:', { user: !!user, loading, isOnboarded: user?.isOnboarded });
  
  if (loading) {
    console.log('⏳ PrivateRoute: Carregando...');
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#111121]">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ PrivateRoute: Sem usuário, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isOnboarded) {
    console.log('⚠️ PrivateRoute: Usuário não onboarded, redirecionando para onboarding');
    return <Navigate to="/onboarding" replace />;
  }
  
  console.log('✅ PrivateRoute: Acesso permitido');
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 4000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-white dark:bg-[#111121] text-slate-950 dark:text-slate-50 overflow-hidden flex flex-col">
          
          {isOffline && (
            <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-center gap-3 animate-slide-down z-[100] border-b border-orange-500/30">
              <span className="material-symbols-outlined text-orange-500 animate-pulse text-[20px]">cloud_off</span>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]">
                Você está offline. <span className="text-orange-400">Os dados serão sincronizados</span> ao retornar.
              </p>
            </div>
          )}

          {showSyncSuccess && !isOffline && (
            <div className="bg-emerald-600 text-white px-6 py-2.5 flex items-center justify-center gap-3 animate-slide-down z-[100]">
              <span className="material-symbols-outlined text-[20px]">sync</span>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]">
                Conexão restabelecida. <span className="opacity-80">Sincronizando dados agora...</span>
              </p>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/login" element={
                <LazyPage>
                  <LoginPage />
                </LazyPage>
              } />
              <Route path="/onboarding" element={
                <OnboardingCheck>
                  <LazyPage>
                    <OnboardingPage />
                  </LazyPage>
                </OnboardingCheck>
              } />
              <Route path="/*" element={
                <PrivateRoute>
                  <div className="flex w-full h-full overflow-hidden">
                    <div className="hidden md:block">
                      <Sidebar />
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="md:hidden flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-[#111121]/80 backdrop-blur-xl z-50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center rotate-3" aria-hidden="true">
                            <span className="material-symbols-outlined text-white text-[20px] font-bold">bloodtype</span>
                          </div>
                          <span className="font-black text-base uppercase">Glico<span className="text-orange-600">SIM</span></span>
                        </div>
                        <LogoutButton />
                      </div>

                      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 custom-scrollbar relative">
                        <LazyPage>
                          <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/registros" element={<RecordsPage />} />
                            <Route path="/medicamentos" element={<MedicationsPage />} />
                            <Route path="/alertas" element={<AlertsPage />} />
                            <Route path="/ajustes" element={<SettingsPage />} />
                            <Route path="/ajuda" element={<HelpPage />} />
                            <Route path="/pro" element={<ProPage />} />
                            <Route path="/atualizacoes" element={<UpdatesPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                          </Routes>
                        </LazyPage>
                        <Footer />
                      </main>

                      {/* Fixed Mobile Bottom Navigation */}
                      <nav 
                        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111121] border-t border-slate-100 dark:border-slate-800/60 z-[1000] flex items-center justify-between px-4"
                        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
                        aria-label="Menu de navegação principal"
                      >
                        <div className="flex w-[40%] justify-around">
                          <MobileNavItem to="/" icon="home" label="Início" />
                          <MobileNavItem to="/registros" icon="analytics" label="Histórico" />
                        </div>

                        {/* Center Floating Action Button (FAB) */}
                        <div className="relative w-[20%] flex justify-center">
                          <Link 
                            to="/registros?new=true"
                            className="absolute -top-10 bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-[#111121] active:scale-90 transition-transform z-[1100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                            aria-label="Adicionar novo registro"
                          >
                            <span className="material-symbols-outlined text-3xl font-bold" aria-hidden="true">add</span>
                          </Link>
                        </div>

                        <div className="flex w-[40%] justify-around">
                          <MobileNavItem to="/alertas" icon="notifications" label="Alertas" />
                          <MobileNavItem to="/ajustes" icon="settings" label="Ajustes" />
                        </div>
                      </nav>
                      {/* Safe Area Spacer for Mobile Menu */}
                      <div className="md:hidden w-full shrink-0" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }}></div>
                    </div>
                  </div>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </div>
      </HashRouter>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        
        @keyframes slide-down {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </AuthProvider>
  );
};

const MobileNavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex flex-col items-center gap-1 transition-all min-w-[44px] min-h-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg ${isActive ? 'text-orange-600' : 'text-slate-500 dark:text-slate-300'}`
    }
    aria-label={label}
  >
    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
  </NavLink>
);

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  return (
    <button
      onClick={() => {
        if (confirm('Deseja sair do sistema?')) {
          logout();
        }
      }}
      className="min-w-[44px] min-h-[44px] rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-200 dark:border-red-800 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      aria-label="Sair do sistema"
    >
      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">logout</span>
    </button>
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
