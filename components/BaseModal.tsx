import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  closeAriaLabel?: string;
  showCloseButton?: boolean;
  lockScroll?: boolean;
}

const joinClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  eyebrow,
  header,
  footer,
  panelClassName,
  overlayClassName,
  bodyClassName,
  headerClassName,
  footerClassName,
  closeButtonClassName,
  closeAriaLabel = 'Fechar modal',
  showCloseButton = true,
  lockScroll = true,
}) => {
  useEffect(() => {
    if (!isOpen || !lockScroll) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen, lockScroll]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={joinClasses(
        'fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in',
        overlayClassName
      )}
    >
      <div
        className={joinClasses(
          'flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)] animate-slide-up dark:border-slate-800 dark:bg-[#111121]',
          panelClassName
        )}
      >
        {(header || title || subtitle || eyebrow || showCloseButton) && (
          <div
            className={joinClasses(
              'flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800',
              headerClassName
            )}
          >
            <div className="min-w-0 flex-1">
              {header || (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      {eyebrow && (
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                          {eyebrow}
                        </p>
                      )}
                      {title && (
                        <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">
                          {title}
                        </h3>
                      )}
                    </div>
                  </div>
                  {subtitle && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={joinClasses(
                  'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-700 bg-red-600 text-white transition-colors hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-700',
                  closeButtonClassName
                )}
                aria-label={closeAriaLabel}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>
        )}

        <div className={joinClasses('min-h-0 flex-1', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className={joinClasses('border-t border-slate-200 px-6 py-5 dark:border-slate-800', footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default BaseModal;
