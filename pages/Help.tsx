
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HelpPage: React.FC = () => {
  const location = useLocation();
  const [activeGuide, setActiveGuide] = useState<'insulin' | 'medications' | null>('insulin');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const guide = params.get('guide');
    if (guide === 'insulin' || guide === 'medications') {
      setActiveGuide(guide);
    }
  }, [location]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 md:pb-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-blue-600 text-2xl">help</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Central de Ajuda</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Guias e orientações para seu tratamento</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <button
          onClick={() => setActiveGuide('insulin')}
          className={`p-3 rounded-xl border-2 transition-all text-left ${activeGuide === 'insulin' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'}`}
        >
          <span className="material-symbols-outlined text-orange-600 text-xl mb-1">syringe</span>
          <h3 className="text-xs font-black text-slate-900 dark:text-white">Guia de Insulina</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Como aplicar</p>
        </button>
        <button
          onClick={() => setActiveGuide('medications')}
          className={`p-3 rounded-xl border-2 transition-all text-left ${activeGuide === 'medications' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
        >
          <span className="material-symbols-outlined text-blue-600 text-xl mb-1">medication</span>
          <h3 className="text-xs font-black text-slate-900 dark:text-white">Medicamentos</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cadastro e uso</p>
        </button>
      </div>

      {activeGuide === 'insulin' && (
        <div className="space-y-6">
          {/* Introdução */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Introdução</h2>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                A aplicação de insulina deve ser feita no tecido subcutâneo (gordura), utilizando rodízio de locais (barriga, coxas, braços ou glúteos) para evitar lipohipertrofia. A agulha deve ser inserida em 90° (com prega se necessário), aguardando 5 a 10 segundos após a injeção antes de retirar. As agulhas ideais são curtas (4mm a 8mm) para evitar aplicação no músculo.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="font-bold">Fonte: Sociedade Brasileira de Diabetes</span>
              </div>
            </div>
          </div>

          {/* Locais de Aplicação */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-2xl">location_on</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Locais de Aplicação</h2>
            </div>
            <div className="flex-1">
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                    <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider mb-2 text-center">Locais Recomendados</h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span><strong>Barriga:</strong> 4 dedos de distância do umbigo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span><strong>Coxas:</strong> Parte frontal e lateral</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span><strong>Braços:</strong> Parte de trás</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span><strong>Glúteos:</strong> Região superior</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2 text-center">⚠️ Rodízio Obrigatório</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Nunca aplicar no mesmo ponto repetidamente. Mantenha distância de <strong>1,5 a 2 cm</strong> entre aplicações para evitar caroços (lipohipertrofia).
                    </p>
                  </div>
                </div>
            </div>
          </div>

          {/* Passo a Passo */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">checklist</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Passo a Passo</h2>
            </div>
            <div className="flex-1">
                <div className="space-y-3">
                  {[
                    { num: 1, title: 'Higienização', desc: 'Lave as mãos. Não é obrigatório usar álcool no local da pele se ela estiver limpa.' },
                    { num: 2, title: 'Preparação', desc: 'Homogeneize a insulina NPH (leitosa) rolando o frasco/caneta entre as mãos. Não agite.' },
                    { num: 3, title: 'Prega Cutânea', desc: 'Faça a prega com dois ou três dedos para separar a gordura do músculo (essencial em pessoas magras ou com agulhas longas).' },
                    { num: 4, title: 'Aplicação', desc: 'Insira a agulha em 90°, injete todo o conteúdo, conte até 5-10 segundos e retire.' },
                    { num: 5, title: 'Descarte', desc: 'Descarte agulhas em coletores de materiais perfurocortantes (frascos de plástico rígido).' }
                  ].map(step => (
                    <div key={step.num} className="flex gap-4 items-start">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-emerald-600">{step.num}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{step.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Cuidados Especiais */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Cuidados Especiais</h2>
            </div>
            <div className="flex-1">
                <div className="grid gap-3">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
                    <h3 className="text-xs font-black text-red-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">block</span>
                      Evite
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">✗</span>
                        <span>Locais com infecção ou inflamação</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">✗</span>
                        <span>Áreas com lipohipertrofia (caroços)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">✗</span>
                        <span>Perna antes de exercícios (acelera absorção)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                      Dicas
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>Agulhas podem ser reutilizadas por até 24h</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>Insulinas fechadas: geladeira</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>Em uso: temperatura ambiente (28 dias)</span>
                      </li>
                    </ul>
                  </div>
                </div>
            </div>
          </div>

          {/* Nota Final */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-3xl">medical_information</span>
              <div>
                <h3 className="text-base font-black mb-1">Importante</h3>
                <p className="text-sm text-orange-100">
                  Sempre siga a orientação do seu médico para doses e horários. Este guia é informativo e não substitui a consulta médica.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeGuide === 'medications' && (
        <div className="space-y-6">
          {/* Introdução */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">medication</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Gerenciamento de Medicamentos</h2>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                O controle adequado do estoque de medicamentos é essencial para garantir a continuidade do tratamento. O GlicoSIM permite cadastrar e monitorar seus medicamentos, alertando quando o estoque estiver baixo.
              </p>
            </div>
          </div>

          {/* Como Cadastrar */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">add_circle</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Como Cadastrar</h2>
            </div>
            <div className="space-y-3">
              {[
                { num: 1, desc: 'Acesse o menu "Medicamentos" no menu lateral' },
                { num: 2, desc: 'Clique no botão "+ Novo Medicamento"' },
                { num: 3, desc: 'Preencha o nome do medicamento' },
                { num: 4, desc: 'Informe a quantidade atual em estoque' },
                { num: 5, desc: 'Escolha a unidade (UI, mg, comprimidos ou ml)' },
                { num: 6, desc: 'Defina o limite mínimo para alerta de estoque baixo' },
                { num: 7, desc: 'Clique em "Salvar" para concluir' }
              ].map(step => (
                <div key={step.num} className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-emerald-600">{step.num}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 pt-0.5">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-2xl">inventory</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Controle Automático</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 text-center">Desconto Automático</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Ao registrar uma glicemia e informar que usou medicamento, a quantidade é <strong>automaticamente descontada</strong> do estoque.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2 text-center">⚠️ Alertas de Estoque</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Quando o estoque atingir o limite mínimo, você verá um <strong>alerta no Dashboard</strong> para repor o medicamento.
                </p>
              </div>
            </div>
          </div>

          {/* Editar e Excluir */}
          <div className="bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col items-center text-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-2xl">edit</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Editar e Excluir</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                <h3 className="text-xs font-black text-purple-600 uppercase tracking-wider mb-2 text-center">Editar Medicamento</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Clique no ícone de <strong>lápis</strong> no card do medicamento para atualizar informações como quantidade, unidade ou limite de estoque.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
                <h3 className="text-xs font-black text-red-600 uppercase tracking-wider mb-2 text-center">Excluir Medicamento</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Clique no ícone de <strong>lixeira</strong> para remover um medicamento. Esta ação é irreversível.
                </p>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-3xl">lightbulb</span>
              <div>
                <h3 className="text-base font-black mb-1">Dicas Importantes</h3>
                <ul className="text-sm text-blue-100 space-y-1 text-left">
                  <li>• Mantenha o estoque sempre atualizado</li>
                  <li>• Configure alertas com antecedência (7-10 dias)</li>
                  <li>• Revise periodicamente os medicamentos cadastrados</li>
                  <li>• Use unidades consistentes para facilitar o controle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
