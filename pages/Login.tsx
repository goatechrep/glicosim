
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabaseService } from '../services/supabaseService';

type PasswordStrength = 'fraco' | 'medio' | 'forte' | 'muito-forte';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('dolwebdesign@hotmail.com');
  const [name, setName] = useState('Diogo Lins');
  const [password, setPassword] = useState('Dol40sk8@');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  // Redirecionar quando o usuário mudar
  useEffect(() => {
    console.log('🔄 Login - Estatus mudou:', { user: !!user, loading, isOnboarded: user?.isOnboarded });
    if (!loading && user) {
      console.log('🔀 Redirecionando usuário...', { isOnboarded: user.isOnboarded });
      if (!user.isOnboarded) {
        console.log('➡️ Indo para onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        console.log('➡️ Indo para dashboard');
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (pwd.length < 6) return 'fraco';
    let strength = 0;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    if (pwd.length >= 12) strength++;
    
    if (strength <= 1) return 'fraco';
    if (strength <= 2) return 'medio';
    if (strength <= 3) return 'forte';
    return 'muito-forte';
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    switch(strength) {
      case 'fraco': return 'bg-red-500';
      case 'medio': return 'bg-yellow-500';
      case 'forte': return 'bg-blue-500';
      case 'muito-forte': return 'bg-green-500';
    }
  };

  const getStrengthText = (strength: PasswordStrength) => {
    switch(strength) {
      case 'fraco': return 'Fraca';
      case 'medio': return 'Média';
      case 'forte': return 'Forte';
      case 'muito-forte': return 'Muito Forte';
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Timer de cooldown para formulário principal
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Timer de cooldown para recuperação de senha
  React.useEffect(() => {
    if (forgotCooldown > 0) {
      const timer = setTimeout(() => setForgotCooldown(forgotCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email
    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }
    setEmailError('');
    setGeneralError('');

    // Verificar cooldown
    if (cooldown > 0) {
      setGeneralError(`Aguarde ${cooldown}s antes de tentar novamente`);
      return;
    }

    // Validar senha no registro
    if (activeTab === 'register' && passwordStrength === 'fraco') {
      setGeneralError('A senha é muito fraca. Use letras maiúsculas, minúsculas, números e símbolos.');
      return;
    }

    setIsLoading(true);
    
    try {
      if (activeTab === 'register') {
        if (!name.trim()) {
          setGeneralError('Por favor, insira um nome');
          setIsLoading(false);
          return;
        }
        
        console.log('📝 Criando conta...');
        await supabaseService.signUp(email, password, name);
        console.log('✅ Conta criada com sucesso');
        setCooldown(30);
      } else {
        console.log('🔑 Fazendo login...');
        await login(email, password);
        console.log('✅ Login realizado com sucesso');
        setCooldown(30);
      }
    } catch (error: any) {
      console.error('Erro durante autenticação:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.message.includes('Invalid login credentials')) {
        setGeneralError('Email ou senha incorretos');
      } else if (error.message.includes('User already registered')) {
        setGeneralError('Este email já está cadastrado');
      } else if (error.message.includes('Perfil do usuário não encontrado')) {
        setGeneralError('Sua conta existe, mas o perfil não foi encontrado. Tente criar uma nova conta.');
      } else if (error.message.includes('Email not confirmed')) {
        setGeneralError('Por favor, confirme seu email antes de fazer login');
      } else if (error.message.includes('rate_limit')) {
        setGeneralError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        setCooldown(60);
      } else {
        setGeneralError(error.message || 'Erro ao processar sua solicitação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(forgotEmail)) {
      alert('Por favor, insira um email válido');
      return;
    }

    // Verificar cooldown
    if (forgotCooldown > 0) {
      alert(`Aguarde ${forgotCooldown}s antes de tentar novamente`);
      return;
    }

    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setForgotLoading(false);
    setForgotSuccess(true);
    setForgotCooldown(60);
    
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111121] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center animate-fade-in">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 transform rotate-3">
              <span className="material-symbols-outlined text-white text-4xl">bloodtype</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Glico<span className="text-orange-600">SIM</span></h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Controle sua glicemia todo dia.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg overflow-hidden">
          {/* Custom Shadcn-like Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'login' 
                ? 'bg-white dark:bg-slate-700 text-orange-600' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'register' 
                ? 'bg-white dark:bg-slate-700 text-orange-600' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="px-6 pb-6 pt-2">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {generalError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">error</span>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{generalError}</p>
                </div>
              )}
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border ${emailError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-orange-500/20 focus:border-orange-500'} transition-all dark:text-white`}
                      placeholder="seu.email@exemplo.com"
                    />
                 </div>
                 {emailError && <p className="text-red-500 text-[10px] font-bold ml-1">{emailError}</p>}
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Senha</label>
                    {activeTab === 'login' && (
                      <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-bold text-orange-600 hover:underline">Esqueceu sua senha?</button>
                    )}
                 </div>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                 </div>
                 {activeTab === 'register' && password && (
                   <div className="space-y-1.5 mt-2">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Força: <span className="text-orange-600">{getStrengthText(passwordStrength)}</span></p>
                       <div className="flex gap-1">
                         {[0,1,2,3].map((i) => (
                           <div
                             key={i}
                             className={`h-1 w-4 rounded-full transition-all ${
                               (passwordStrength === 'fraco' && i === 0) ||
                               (passwordStrength === 'medio' && i <= 1) ||
                               (passwordStrength === 'forte' && i <= 2) ||
                               (passwordStrength === 'muito-forte' && i <= 3)
                                 ? getStrengthColor(passwordStrength)
                                 : 'bg-slate-200 dark:bg-slate-700'
                             }`}
                           />
                         ))}
                       </div>
                     </div>
                     {passwordStrength === 'fraco' && (
                       <p className="text-[10px] text-red-500 font-semibold">Use maiúsculas, minúsculas, números e símbolos</p>
                     )}
                   </div>
                 )}
              </div>

              <button 
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="w-full py-3.5 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-orange-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {cooldown > 0
                  ? `Aguarde ${cooldown}s...`
                  : isLoading 
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
      </div>

      {/* Modal Esqueceu Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recuperar Senha</h2>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">Email enviado!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Verifique sua caixa de entrada para instruções de recuperação de senha.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Digite seu email e enviaremos um link para recuperar sua senha.</p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">alternate_email</span>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || forgotCooldown > 0}
                  className="w-full py-3 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.1em] rounded-xl hover:bg-orange-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                  {forgotCooldown > 0 ? (
                    `Aguarde ${forgotCooldown}s...`
                  ) : forgotLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ENVIANDO...
                    </span>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.1em] hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Voltar ao Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
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
