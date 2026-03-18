import React from 'react';
import BaseModal from './BaseModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
}) => {
  const toneClasses = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-amber-500 hover:bg-amber-600';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="max-w-sm rounded-3xl"
      bodyClassName="px-6 pb-8 pt-6 md:px-8"
      overlayClassName="bg-slate-950/90 backdrop-blur-2xl p-4 md:p-6"
      title={<span className="uppercase">{title}</span>}
      subtitle={description}
    >
      <div className="space-y-8 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${tone === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' : 'bg-amber-50 text-amber-500 dark:bg-amber-950/20'}`}>
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full rounded-lg py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all ${toneClasses}`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmDialog;
