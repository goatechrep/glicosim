import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  };

  return (
    <div className={`
      flex items-center gap-3 
      px-5 py-4 
      rounded-2xl border shadow-lg
      backdrop-blur-sm
      animate-slide-in-right
      ${styles[type]}
    `}>
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        {icons[type]}
      </span>
      <p className="text-sm font-bold flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 rounded"
        aria-label="Fechar notificação"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ 
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' }>; 
  onRemove: (id: number) => void;
}> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md" role="region" aria-label="Notificações">
    {toasts.map(toast => (
      <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
    ))}
  </div>
);

export default Toast;
