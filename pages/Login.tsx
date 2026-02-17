
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation
    await new Promise(r => setTimeout(r, 800));
    await login({ nome: isLogin ? (email.split('@')[0]) : nome, email });
    setIsLoading(false);
    navigate(isLogin ? '/' : '/onboarding');
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login({ nome: `User ${provider}`, email: `${provider.toLowerCase()}@example.com` });
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans">
      <div className="max-w-md w-full space-y-8 bg-black border border-gray-800 p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-blue-500 italic">GlicoSIM</h1>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                placeholder="nome@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {isLoading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR' : 'CADASTRAR')}
            </button>
          </div>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-4 text-gray-500 tracking-widest">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['Google', 'Facebook', 'Instagram'].map(provider => (
            <button
              key={provider}
              onClick={() => handleSocialLogin(provider)}
              className="py-3 px-2 border border-gray-800 bg-gray-900 text-xs font-bold hover:bg-gray-800 transition-all text-gray-300 uppercase tracking-tighter"
            >
              {provider}
            </button>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Entre aqui'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
