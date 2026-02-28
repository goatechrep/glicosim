import React, { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'glicosim_pwa_prompt_hidden';

interface PWAInstallPromptProps {
  mode?: 'floating' | 'banner';
}

interface InstallStep {
  title: string;
  description: string;
  media: string;
  fallbackIcon: string;
}

const GUIDE_STEPS: Record<'android' | 'ios', InstallStep[]> = {
  android: [
    {
      title: 'Abra no Chrome',
      description: 'Use o navegador Chrome para instalar como aplicativo.',
      media: '/install/android-step-1.gif',
      fallbackIcon: 'language'
    },
    {
      title: 'Toque no menu',
      description: 'Abra o menu de tres pontos no canto superior do navegador.',
      media: '/install/android-step-2.gif',
      fallbackIcon: 'more_vert'
    },
    {
      title: 'Instale na tela inicial',
      description: 'Toque em "Instalar app" ou "Adicionar a tela inicial".',
      media: '/install/android-step-3.gif',
      fallbackIcon: 'install_mobile'
    }
  ],
  ios: [
    {
      title: 'Abra no Safari',
      description: 'No iPhone/iPad, a instalacao funciona pelo Safari.',
      media: '/install/ios-step-1.gif',
      fallbackIcon: 'language'
    },
    {
      title: 'Toque em Compartilhar',
      description: 'Use o botao de compartilhar na barra inferior do Safari.',
      media: '/install/ios-step-2.gif',
      fallbackIcon: 'ios_share'
    },
    {
      title: 'Adicionar a Tela de Inicio',
      description: 'Selecione "Adicionar a Tela de Inicio" e confirme.',
      media: '/install/ios-step-3.gif',
      fallbackIcon: 'add_to_home_screen'
    }
  ]
};

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ mode = 'floating' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidePermanently, setHidePermanently] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<'android' | 'ios'>('android');
  const [currentStep, setCurrentStep] = useState(0);
  const [mediaErrors, setMediaErrors] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (!open) return;
    setSelectedGuide(isIOS ? 'ios' : 'android');
    setCurrentStep(0);
  }, [open, isIOS]);

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

  const guideSteps = GUIDE_STEPS[selectedGuide];
  const step = guideSteps[currentStep];
  const stepKey = `${selectedGuide}-${currentStep}`;
  const hasMediaError = Boolean(mediaErrors[stepKey]);

  const goPrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goNextStep = () => {
    setCurrentStep(prev => Math.min(guideSteps.length - 1, prev + 1));
  };

  const handleGuideChange = (guide: 'android' | 'ios') => {
    setSelectedGuide(guide);
    setCurrentStep(0);
  };

  return (
    <>
      {mode === 'banner' ? (
        <button
          onClick={() => setOpen(true)}
          className="my-2 w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-all hover:bg-orange-100 dark:hover:bg-orange-900/30"
          aria-label="Instalar aplicativo no celular"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Instalar app</span>
          </span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 md:right-6 bottom-24 md:bottom-6 z-[1200] flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-full shadow-xl border border-orange-500 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label="Instalar aplicativo no celular"
        >
          <span className="material-symbols-outlined text-[18px]">install_mobile</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Instalar App</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[1300] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-[100dvh] md:h-auto md:max-h-[92vh] md:max-w-xl bg-white dark:bg-[#111121] border border-slate-200 dark:border-slate-800 rounded-none md:rounded-2xl overflow-hidden animate-slide-up flex flex-col">
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

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Instale o app na tela inicial para abrir mais rapido e usar com experiencia nativa.
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
                  onClick={() => handleGuideChange('android')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    selectedGuide === 'android'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => handleGuideChange('ios')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    selectedGuide === 'ios'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  iOS
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {selectedGuide === 'android' ? 'Android' : 'iOS'} • Passo {currentStep + 1}/{guideSteps.length}
                  </p>
                  <div className="flex items-center gap-1">
                    {guideSteps.map((_, index) => (
                      <span
                        key={`${selectedGuide}-dot-${index}`}
                        className={`h-1.5 rounded-full transition-all ${index === currentStep ? 'w-5 bg-orange-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-48 md:h-56">
                  {!hasMediaError ? (
                    <img
                      src={step.media}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      onError={() => setMediaErrors(prev => ({ ...prev, [stepKey]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                      <span className="material-symbols-outlined text-5xl">{step.fallbackIcon}</span>
                      <p className="text-xs font-bold text-center px-4">
                        Adicione um GIF em <code>{step.media}</code>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {step.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={goPrevStep}
                    disabled={currentStep === 0}
                    className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Passo anterior"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    onClick={goNextStep}
                    disabled={currentStep === guideSteps.length - 1}
                    className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Próximo passo"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 pt-3 pb-12 md:pb-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
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
