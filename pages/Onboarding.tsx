
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabaseService } from '../services/supabaseService';
import { dataSyncService } from '../services/dataSyncService';
import { Periodo, Medicamento } from '../types';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [glicemy, setGlicemy] = useState<number>(0);
  const [glicemyError, setGlicemyError] = useState('');
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();

  const handleGlicemyChange = (value: number) => {
    setGlicemyError('');
    setShowEmergencyAlert(false);

    // Validar números negativos
    if (value < 0) {
      setGlicemyError('A glicemia não pode ser negativa');
      return;
    }

    // Validar limite máximo
    if (value > 400) {
      setShowEmergencyAlert(true);
      setGlicemyError('Valor crítico! Procure um médico imediatamente');
      setGlicemy(value);
      return;
    }

    setGlicemy(value);
  };

  const handleFinish = async () => {
    if (glicemy > 400) {
      alert('⚠️ AVISO: Glicemia crítica!\n\nValor acima de 400 mg/dL\n\nProcure ajuda médica IMEDIATAMENTE:\n\n🚑 AMBULÂNCIA: 192\n🚨 RESGATE: 193\n\nNão prossiga sem atendimento médico!');
      return;
    }

    if (glicemy < 0) {
      alert('Valor de glicemia inválido');
      return;
    }

    if (!user) {
      alert('Usuário não encontrado');
      return;
    }

    try {

      const userPlan = user.isPro ? 'PRO' : 'FREE';
      console.log(`Finalizando onboarding para usuário ${user.id} com plano ${userPlan} e glicemia inicial de ${glicemy} mg/dL...`);

      const recordData = {
        id: Date.now().toString(),
        userId: user.id,
        periodo: Periodo.CAFE_MANHA,
        medicamento: Medicamento.NENHUM,
        antesRefeicao: glicemy,
        aposRefeicao: 0,
        dose: '0',
        notes: 'Setup inicial realizado com sucesso.',
        data: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };

      console.log('💾 Salvando registro:', recordData);
      await dataSyncService.saveRecord(recordData);
      
      console.log('💾 Verificando localStorage:', localStorage.getItem('glicosim_data_backup'));

      const localData = {
        user: [user],
        records: [recordData],
        alerts: [],
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      dataSyncService.saveToLocalStorage(user.id, localData);

      await supabaseService.updateUser(user.id, { isOnboarded: true });
      await refreshUser();
      navigate('/');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111121] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 p-12 rounded-[3.5rem] text-center animate-fade-in relative overflow-hidden">

          {step === 1 ? (
            <div className="space-y-12 animate-slide-up">
              {/* Exemplo visual de Instalação */}
              <div className="relative mx-auto w-full aspect-video bg-gradient-to-br from-orange-50 to-white dark:from-slate-900/40 dark:to-[#111121] rounded-lg flex flex-col items-center justify-center border-2 border-orange-100 dark:border-orange-900/20 overflow-hidden">
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
                <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">Bem-vindo ao Glico<span className="text-orange-600">SIM</span></h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-sm mx-auto">
                  Seu novo assistente inteligente para controle glicêmico e da saúde.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-6 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-lg hover:bg-orange-700 transition-all active:scale-95"
              >
                Continuar Setup
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-slide-up">
              <div className="relative mx-auto w-full aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-lg flex flex-col items-center justify-center border-2 border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-7xl text-orange-600 mb-3 animate-pulse">query_stats</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/20 border border-orange-200/50"></div>)}
                </div>
                <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Calibrando Histórico</p>
              </div>

              <div className="space-y-4">
                <span className="text-orange-600 text-[11px] font-black uppercase tracking-[0.4em]">Finalizando</span>
                <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase leading-none">Sua Glicemia Atual</h2>
                <p className="text-slate-500 text-sm font-medium">Informe o valor para seu primeiro gráfico oficial.</p>
              </div>

              <div className="py-2">
                <div className="relative flex flex-col items-center">
                  <input
                    type="number"
                    value={glicemy || ''}
                    onChange={(e) => handleGlicemyChange(Number(e.target.value))}
                    className={`w-full text-center text-8xl font-black bg-transparent border-none outline-none dark:text-white transition-colors ${glicemyError ? 'text-red-600' : 'text-orange-600'
                      } selection:bg-orange-100`}
                    autoFocus
                  />
                  <div className={`text-[14px] font-black uppercase tracking-[0.3em] mt-4 ${glicemyError ? 'text-red-500' : 'text-slate-400'
                    }`}>
                    {glicemyError ? '⚠️ ' + glicemyError : 'mg/dL'}
                  </div>
                </div>
              </div>

              {/* Alerta de Emergência */}
              {showEmergencyAlert && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6 animate-pulse space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-red-600 text-3xl">emergency</span>
                    <p className="text-red-600 font-black uppercase text-sm tracking-wider">ALERTA CRÍTICO</p>
                  </div>
                  <p className="text-red-700 dark:text-red-300 font-bold text-base leading-relaxed">
                    Glicemia acima de 400 mg/dL é um nível crítico!
                  </p>
                  <div className="space-y-2 pt-2 border-t-2 border-red-200 dark:border-red-800">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Procure atendimento médico imediatamente:</p>
                    <div className="flex gap-4 justify-center">
                      <div className="text-center">
                        <p className="text-red-600 font-black text-xl">192</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Ambulância</p>
                      </div>
                      <div className="w-px bg-red-300 dark:bg-red-700"></div>
                      <div className="text-center">
                        <p className="text-red-600 font-black text-xl">193</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Resgate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleFinish}
                  disabled={!glicemy || glicemyError !== ''}
                  className="w-full py-6 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 active:scale-95"
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
