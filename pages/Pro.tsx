
import React from 'react';
import { useAuth } from '../App';
import { getPlanById, getFormattedPrice } from '../data/plans';

const ProPage: React.FC = () => {
  const { user } = useAuth();
  const proPlan = getPlanById('PRO');

  const features = proPlan?.recursos.slice(1).map((recurso, index) => {
    const icons = ['cloud_sync', 'block', 'backup', 'devices', 'support_agent', 'analytics'];
    const titles = ['Sincronização na Nuvem', 'Sem Propagandas', 'Backup Automático', 'Multi-Dispositivos', 'Suporte Prioritário', 'Relatórios Avançados'];
    const descs = [
      'Seus dados seguros e acessíveis de qualquer dispositivo',
      'Experiência limpa e focada no seu tratamento',
      'Nunca perca seus registros de glicemia',
      'Acesse de celular, tablet ou computador',
      'Atendimento rápido quando você precisar',
      'Análises detalhadas do seu controle glicêmico'
    ];
    return { icon: icons[index], title: titles[index], desc: descs[index] };
  }) || [];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 md:pb-0">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white text-4xl">workspace_premium</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
          Plano <span className="text-orange-600">{proPlan?.nome}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
          Leve seu controle glicêmico para o próximo nível
        </p>
      </div>

      {user?.plano === 'PRO' ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-emerald-600 text-5xl mb-4">check_circle</span>
          <h2 className="text-2xl font-black text-emerald-600 mb-2">Você já é PRO!</h2>
          <p className="text-slate-600 dark:text-slate-300">Aproveite todos os benefícios do seu plano</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-baseline gap-3 mb-4">
                <span className="text-5xl md:text-6xl font-black">{getFormattedPrice(proPlan!)}</span>
                <span className="text-2xl text-orange-200">/{proPlan?.periodo}</span>
              </div>
              <p className="text-orange-100 mb-6 text-sm md:text-base">
                Cancele quando quiser, sem multas ou taxas
              </p>
              <button className="px-8 py-4 bg-white text-orange-600 font-black text-sm uppercase rounded-xl hover:bg-orange-50 transition-all shadow-lg">
                Assinar Agora
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-orange-600 text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">Como funciona o pagamento?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  O pagamento é mensal e automático. Você pode cancelar a qualquer momento sem custos adicionais.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">Meus dados ficam seguros?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sim! Utilizamos criptografia de ponta e servidores seguros para proteger suas informações de saúde.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">Posso testar antes de assinar?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Oferecemos 7 dias de teste grátis para você conhecer todos os recursos PRO.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProPage;
