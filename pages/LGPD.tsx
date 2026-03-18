import React from 'react';
import { legalContent } from '../data/legalContent';

const LgpdPage: React.FC = () => {
  const content = legalContent.lgpd;

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-3 border-b border-slate-200 pb-6 dark:border-slate-800">
        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-orange-600 dark:bg-orange-950/30 dark:text-orange-300">
          Juridico
        </span>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-orange-600 dark:text-white">{content.title}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Conteudo ficticio de teste para validar a navegacao e a apresentacao de uma pagina juridica dedicada.
          </p>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Ultima atualizacao: {content.updatedAt}
        </p>
      </header>

      <div className="space-y-4">
        {content.sections.map((section) => (
          <section key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111121]">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">{section.heading}</h3>
            <div className="mt-4 space-y-3">
              {section.body.map((paragraph, index) => (
                <p key={`${section.heading}-${index}`} className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default LgpdPage;

