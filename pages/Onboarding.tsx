
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
        <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-12 rounded-[3rem] shadow-2xl text-center animate-fade-in relative overflow-hidden">
          
          {step === 1 ? (
            <div className="space-y-10 animate-slide-up">
              {/* Image Example Representation */}
              <div className="relative mx-auto w-full aspect-video bg-orange-50 dark:bg-orange-950/20 rounded-4xl flex items-center justify-center border-2 border-orange-100 dark:border-orange-900/30 overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent"></div>
                 <span className="material-symbols-outlined text-8xl text-orange-600 transition-transform group-hover:scale-110 duration-500">monitoring</span>
                 <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <div className="h-2 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full w-2/3 bg-orange-600"></div>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase leading-tight">Boas-vindas ao <span className="text-orange-600">GlicoSIM</span></h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-sm mx-auto">
                  A tecnologia a favor do seu controle glicêmico. Vamos configurar seu ambiente em 30 segundos.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/30 active:scale-95"
              >
                Começar Jornada
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-slide-up">
              {/* Second Image Example: Data Input */}
              <div className="relative mx-auto w-full aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-4xl flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
                 <div className="grid grid-cols-3 gap-3 p-8 w-full opacity-40">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
                 </div>
                 <div className="absolute flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl text-orange-600 mb-2">bloodtype</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entrada de Dados</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <span className="text-orange-600 text-[11px] font-black uppercase tracking-[0.4em]">Passo Final</span>
                 <h2 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase">Sua Glicemia Agora</h2>
                 <p className="text-slate-500 text-sm font-medium">Informe o seu último índice para começarmos o gráfico.</p>
              </div>
              
              <div className="py-4">
                <div className="relative flex flex-col items-center">
                  <input
                    type="number"
                    value={glicemy || ''}
                    onChange={(e) => setGlicemy(Number(e.target.value))}
                    className="w-full text-center text-8xl font-black bg-transparent border-none outline-none dark:text-white text-orange-600 selection:bg-orange-100"
                    autoFocus
                  />
                  <div className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Miligramas por Decilitro (mg/dL)</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleFinish}
                  disabled={!glicemy}
                  className="w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/30 disabled:opacity-50 active:scale-95"
                >
                  Concluir Configuração
                </button>
                <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Voltar</button>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-center gap-2">
             <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-orange-600' : 'w-3 bg-slate-100 dark:bg-slate-800'}`}></div>
             <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-orange-600' : 'w-3 bg-slate-100 dark:bg-slate-800'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
