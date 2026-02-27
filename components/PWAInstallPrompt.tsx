import React, { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'glicosim_pwa_prompt_hidden';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidePermanently, setHidePermanently] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<'android' | 'ios'>('android');

  const isIOS = useMemo(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    []
  );

  useEffect(() => {
    const hidden = localStorage.getItem(DISMISS_KEY) === '1';
    setHidePermanently(hidden);

    const updateStandalone = () => {
      const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(standaloneMode);
    };

    updateStandalone();
    window.addEventListener('appinstalled', updateStandalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    return () => {
      window.removeEventListener('appinstalled', updateStandalone);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    };
  }, []);

  if (isStandalone || hidePermanently) return null;

  const closeModal = () => setOpen(false);

  const dismissPermanently = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidePermanently(true);
    setOpen(false);
  };

  const handleInstallNow = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setOpen(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 md:right-6 bottom-24 md:bottom-6 z-[1200] flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-full shadow-xl border border-orange-500 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Instalar aplicativo no celular"
      >
        <span className="material-symbols-outlined text-[18px]">install_mobile</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Instalar App</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[1300] bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="w-full md:max-w-lg bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Instalar GlicoSIM</h3>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center"
                aria-label="Fechar modal de instalação"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Instale o app na tela inicial para abrir mais rápido e usar com experiência nativa.
              </p>

              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallNow}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all"
                >
                  Instalar Agora
                </button>
              )}

              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <button
                  onClick={() => setSelectedGuide('android')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    selectedGuide === 'android'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setSelectedGuide('ios')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    selectedGuide === 'ios'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  iOS
                </button>
              </div>

              {selectedGuide === 'android' ? (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>1. Abra o site no Chrome.</p>
                  <p>2. Toque em menu (três pontos).</p>
                  <p>3. Toque em "Adicionar à tela inicial" ou "Instalar app".</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>1. Abra o site no Safari.</p>
                  <p>2. Toque no botão de compartilhar.</p>
                  <p>3. Toque em "Adicionar à Tela de Início".</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-widest"
              >
                Fechar
              </button>
              <button
                onClick={dismissPermanently}
                className="flex-1 py-3 bg-slate-900 text-white dark:bg-slate-700 rounded-xl text-[11px] font-black uppercase tracking-widest"
              >
                Não mostrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
