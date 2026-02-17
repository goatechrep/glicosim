
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { mockService } from '../services/mockService';
import { Periodo, Medicamento } from '../types';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [glicemy, setGlicemy] = useState<number>(0);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    await mockService.createRecord({
      periodo: Periodo.CAFE_MANHA,
      medicamento: Medicamento.NENHUM,
      antesRefeicao: glicemy,
      dose: '0',
      notes: 'Registro inicial de boas-vindas',
      data: new Date().toISOString().split('T')[0]
    });
    await mockService.updateUser({ isOnboarded: true });
    await refreshUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full space-y-12">
        {step === 1 && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="mx-auto w-24 h-24 bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-5xl">
              👋
            </div>
            <h1 className="text-4xl font-black tracking-tighter">BEM-VINDO AO GLICOSIM</h1>
            <p className="text-gray-400 leading-relaxed">
              O controle da sua saúde começa agora. Vamos configurar o básico para você começar com o pé direito.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              VAMOS COMEÇAR
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Passo Final</span>
              <h2 className="text-3xl font-black tracking-tighter italic">SUA PRIMEIRA MEDIÇÃO</h2>
              <p className="text-gray-400">Como está sua glicemia agora?</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="number"
                placeholder="0"
                value={glicemy || ''}
                onChange={(e) => setGlicemy(Number(e.target.value))}
                className="w-full text-center text-7xl font-black bg-transparent border-b-2 border-gray-800 focus:border-blue-500 outline-none py-4"
              />
              <p className="text-center text-xs font-bold text-gray-600 uppercase tracking-widest">mg/dL</p>
            </div>

            <button
              onClick={handleFinish}
              disabled={!glicemy}
              className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30"
            >
              FINALIZAR CONFIGURAÇÃO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
