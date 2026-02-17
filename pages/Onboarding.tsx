
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { Periodo, Medicamento } from '../types';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [glicemy, setGlicemy] = useState<number>(100);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    await mockService.createRecord({
      periodo: Periodo.CAFE_MANHA,
      medicamento: Medicamento.NENHUM,
      antesRefeicao: glicemy,
      dose: '0',
      notes: 'Setup inicial realizado com sucesso.',
      data: new Date().toISOString().split('T')[0]
    });
    await mockService.updateUser({ isOnboarded: true });
    await refreshUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111121] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] text-center animate-fade-in relative overflow-hidden">
          
          {step === 1 ? (
            <div className="space-y-12 animate-slide-up">
              {/* Exemplo visual de Instalação */}
              <div className="relative mx-auto w-full aspect-video bg-gradient-to-br from-orange-50 to-white dark:from-slate-900/40 dark:to-[#111121] rounded-4xl flex flex-col items-center justify-center border-2 border-orange-100 dark:border-orange-900/20 overflow-hidden shadow-inner">
                 <div className="absolute top-0 left-0 w-full h-1 bg-orange-600 animate-loading-bar"></div>
                 <span className="material-symbols-outlined text-[100px] text-orange-600 mb-4 animate-bounce">install_mobile</span>
                 <div className="flex gap-2">
                    <div className="w-12 h-1 bg-orange-200 dark:bg-orange-900/40 rounded-full"></div>
                    <div className="w-4 h-1 bg-orange-600 rounded-full"></div>
                    <div className="w-12 h-1 bg-orange-200 dark:bg-orange-900/40 rounded-full"></div>
                 </div>
                 <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Configurando PWA</p>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">Bem-vindo ao <span className="text-orange-600">GlicoSIM</span></h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-sm mx-auto">
                  Seu novo assistente inteligente para controle glicêmico e planos de saúde.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-6 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
              >
                Continuar Setup
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-slide-up">
              <div className="relative mx-auto w-full aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-4xl flex flex-col items-center justify-center border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                 <span className="material-symbols-outlined text-7xl text-orange-600 mb-3 animate-pulse">query_stats</span>
                 <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/20 border border-orange-200/50"></div>)}
                 </div>
                 <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Calibrando Histórico</p>
              </div>

              <div className="space-y-4">
                 <span className="text-orange-600 text-[11px] font-black uppercase tracking-[0.4em]">Passo Final</span>
                 <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase leading-none">Sua Glicemia Atual</h2>
                 <p className="text-slate-500 text-sm font-medium">Informe o valor para seu primeiro gráfico oficial.</p>
              </div>
              
              <div className="py-2">
                <div className="relative flex flex-col items-center">
                  <input
                    type="number"
                    value={glicemy || ''}
                    onChange={(e) => setGlicemy(Number(e.target.value))}
                    className="w-full text-center text-8xl font-black bg-transparent border-none outline-none dark:text-white text-orange-600 selection:bg-orange-100"
                    autoFocus
                  />
                  <div className="text-[14px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4">mg/dL</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleFinish}
                  disabled={!glicemy}
                  className="w-full py-6 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/30 disabled:opacity-50 active:scale-95"
                >
                  Ativar Painel
                </button>
                <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Voltar</button>
              </div>
            </div>
          )}

          <div className="mt-14 flex justify-center gap-2">
             <div className={`h-2 rounded-full transition-all duration-700 ${step === 1 ? 'w-16 bg-orange-600' : 'w-4 bg-slate-100 dark:bg-slate-800'}`}></div>
             <div className={`h-2 rounded-full transition-all duration-700 ${step === 2 ? 'w-16 bg-orange-600' : 'w-4 bg-slate-100 dark:bg-slate-800'}`}></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar { animation: loading-bar 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default OnboardingPage;
