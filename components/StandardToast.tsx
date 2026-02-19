import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[10999] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-fade-in pointer-events-none">
      <div className={`pointer-events-auto min-w-[320px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-sm animate-zoom-in ${
        type === 'success' 
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
      }`}>
        <span className="material-symbols-outlined text-2xl">
          {type === 'success' ? 'check_circle' : 'error'}
        </span>
        <span className="text-sm font-bold uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
};
