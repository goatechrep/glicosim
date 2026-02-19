import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-emerald-500 dark:bg-emerald-600',
      border: 'border-emerald-600 dark:border-emerald-700',
      icon: 'check_circle',
      title: '✓ Sucesso!',
    },
    error: {
      bg: 'bg-red-500 dark:bg-red-600',
      border: 'border-red-600 dark:border-red-700',
      icon: 'error',
      title: '✕ Erro',
    },
    info: {
      bg: 'bg-blue-500 dark:bg-blue-600',
      border: 'border-blue-600 dark:border-blue-700',
      icon: 'info',
      title: 'ℹ Informação',
    },
    warning: {
      bg: 'bg-amber-500 dark:bg-amber-600',
      border: 'border-amber-600 dark:border-amber-700',
      icon: 'warning',
      title: '⚠ Aviso',
    },
  };

  const style = styles[type];

  return (
    <>
      {/* Overlay opaco */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Toast centralizado */}
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]
        flex flex-col items-center justify-center gap-6
        px-8 py-7 min-w-[320px] max-w-md
        rounded-2xl border-2
        shadow-2xl
        animate-scale-fade-in
        ${style.bg} ${style.border} text-white
      `}>
        <span className="material-symbols-outlined text-[56px] font-bold">
          {style.icon}
        </span>
        
        <div className="text-center max-w-sm">
          <p className="text-lg font-black uppercase tracking-wider mb-2">
            {style.title}
          </p>
          <p className="text-sm font-medium opacity-95 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          OK
        </button>
      </div>
    </>
  );
};

export const ToastContainer: React.FC<{ 
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' }>; 
  onRemove: (id: number) => void;
}> = ({ toasts, onRemove }) => (
  <>
    {toasts.map(toast => (
      <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
    ))}
  </>
);

export default Toast;
