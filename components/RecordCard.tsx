import React from 'react';
import { GlucoseRecord } from '../types';

interface RecordCardProps {
  record: GlucoseRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onEdit, onDelete }) => {
  const getGlicemiaColor = (value: number) => {
    if (value > 180) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    if (value > 140) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
    if (value < 70) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
  };

  return (
    <div className="
      bg-white dark:bg-[#111121] 
      border border-slate-200 dark:border-slate-800 
      rounded-2xl p-5 
      hover:shadow-lg transition-all duration-300
      active:scale-[0.98]
    ">
      {/* Header com data e ações */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center" aria-hidden="true">
            <span className="material-symbols-outlined text-orange-600 text-[20px]">
              calendar_today
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {new Date(record.data).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric'
              })}
            </p>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              {record.periodo}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="min-w-[44px] min-h-[44px] md:w-8 md:h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Editar registro"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="min-w-[44px] min-h-[44px] md:w-8 md:h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Excluir registro"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Glicemia destaque */}
      <div className={`
        inline-flex items-baseline gap-2 px-4 py-2 rounded-xl mb-4
        ${getGlicemiaColor(record.antesRefeicao)}
      `}>
        <span className="text-3xl font-black tracking-tight">
          {record.antesRefeicao}
        </span>
        <span className="text-xs font-bold uppercase">mg/dL</span>
      </div>

      {/* Detalhes */}
      {(record.medicamento !== 'Nenhum' || record.dose !== '0') && (
        <div className="grid grid-cols-2 gap-3">
          {record.medicamento !== 'Nenhum' && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[16px]" aria-hidden="true">
                medication
              </span>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                  Medicamento
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {record.medicamento}
                </p>
              </div>
            </div>
          )}
          
          {record.dose !== '0' && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[16px]" aria-hidden="true">
                science
              </span>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">
                  Dose
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {record.dose}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas (se existir) */}
      {record.notes && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 italic">
            "{record.notes}"
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordCard;
