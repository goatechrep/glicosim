import React from 'react';
import { legalContent, LegalContentType } from '../data/legalContent';

interface LegalModalProps {
  type: LegalContentType | null;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = legalContent[type];

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">Documento de teste</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{content.title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Atualizado em {content.updatedAt}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label="Fechar modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="max-h-[calc(85vh-96px)] overflow-y-auto px-6 py-5 space-y-6">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{section.heading}</h3>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
