
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { socialLinks } from '../data/socialLinks';
import { appInfo } from '../data/appInfo';
import LegalModal from './LegalModal';
import { LegalContentType } from '../data/legalContent';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const version = 'v1.5.0';
  const [activeLegalModal, setActiveLegalModal] = useState<LegalContentType | null>(null);

  return (
    <footer className="bg-white dark:bg-[#111121] border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-7">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10 mb-10">
          {/* Logo e Info - Alinhamento Responsivo */}
          <div className="flex flex-col items-center md:items-left text-justify md:text-left lg:order-1">
            <div className="flex items-center align-left gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-orange-500/20">
                <span className="material-symbols-outlined text-white text-[18px]">bloodtype</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Glico<span className="text-orange-600">SIM</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed max-w-sm lg:max-w-xs">
              {appInfo.description}
            </p>

            <div className="inline-flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Versão</span>
              <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase">{version}</span>
            </div>
          </div>

          {/* Links e Social - Grid Adaptável */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:order-2 lg:flex-1">
            {/* Coluna 1 */}
            <div className="text-center lg:text-left">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4 opacity-50">
                Suporte
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <NavLink to="/ajuda" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors">
                    Ajuda
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/atualizacoes" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors">
                    Novidades
                  </NavLink>
                </li>
                <li>
                  <a href="#" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 2 */}
            <div className="text-center lg:text-left">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4 opacity-50">
                Jurídico
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors">
                    LGPD
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal('terms')}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal('privacy')}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    Política de Privacidade
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna Social */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center lg:items-start">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4 opacity-50">
                Social
              </h4>
              <div className="flex gap-3">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-600/70 uppercase tracking-widest text-center leading-relaxed">
            ** Este app não substitui consultas médicas. Sempre que possível, consulte o seu médico para interpretação dos resultados e orientações personalizadas. O GlicoSIM é uma ferramenta de apoio, não um diagnóstico definitivo.
          </p>

          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center">
              <p className="text-[10px] font-bold text-slate-400 text-center md:text-left">
                © {currentYear} GlicoSIM • Todos os direitos reservados.
              </p>

              <div className="flex justify-center">
                <a
                  href="https://status.goatech.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
                  Status do Serviço
                </a>
              </div>

              <div className="flex justify-center md:justify-end">
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 group/logo"
                >
                  <span className="text-[9px] font-black text-slate-400/80 uppercase tracking-widest">Desenvolvido por</span>
                  <span className="text-[10px] font-black text-orange-600 transition-transform group-hover/logo:scale-105">GOATECH</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LegalModal type={activeLegalModal} onClose={() => setActiveLegalModal(null)} />
    </footer>
  );
};

export default Footer;
