
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { Periodo, Medicamento } from '../types';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [glicemy, setGlicemy] = useState<number>(100); // Mocked for easy testing
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-2xl elevation-2 text-center animate-fade-in">
          
          {step === 1 ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">celebration</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold dark:text-white">Bem-vindo ao GlicoSIM</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Vamos configurar seu perfil rapidamente para você começar a monitorar sua saúde hoje mesmo.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-orange-600 text-white font-semibold text-sm rounded-lg hover:bg-orange-700 transition-all"
              >
                Começar Configuração
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                 <span className="text-orange-600 text-[11px] font-bold uppercase tracking-widest">Passo Final</span>
                 <h2 className="text-xl font-bold dark:text-white">Qual sua glicemia agora?</h2>
              </div>
              
              <div className="py-8">
                <div className="relative inline-block w-full">
                  <input
                    type="number"
                    value={glicemy || ''}
                    onChange={(e) => setGlicemy(Number(e.target.value))}
                    className="w-full text-center text-6xl font-black bg-transparent border-none outline-none dark:text-white text-orange-600"
                  />
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">mg/dL</div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={!glicemy}
                className="w-full py-3 bg-orange-600 text-white font-semibold text-sm rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                Finalizar e Ir ao Painel
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-1.5">
             <div className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-8 bg-orange-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}></div>
             <div className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-8 bg-orange-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
