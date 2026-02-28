
import React from 'react';
import { NavLink } from 'react-router-dom';
import { socialLinks } from '../data/socialLinks';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const version = 'v1.5.0';

  return (
    <footer className="bg-white dark:bg-[#111121] border-t border-slate-200 dark:border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Logo e Copyright */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center rotate-3">
                <span className="material-symbols-outlined text-white text-[18px]">bloodtype</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Glico<span className="text-orange-600">SIM</span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              Controle sua glicemia todo dia.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Versão</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{version}</span>
            </div>
          </div>

          {/* Links Úteis e Redes Sociais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Links Coluna 1 */}
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Links Úteis
              </h4>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/ajuda" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Central de Ajuda
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/atualizacoes" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Atualizações
                  </NavLink>
                </li>
                <li>
                  <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Fale Conosco
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Coluna 2 */}
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 opacity-0">
                .
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    LGPD
                  </a>
                </li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Redes Sociais
              </h4>
              <div className="flex flex-wrap gap-2">
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href={socialLinks.threads} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.058-1.84.355-2.456.882-.578.495-.897 1.187-.897 1.941.058.86.403 1.472.97 1.864.635.439 1.441.588 2.328.541 1.139-.061 1.957-.505 2.43-1.319.472-.813.7-2.08.68-3.77l-.007-.295c-.007-2.366-.013-4.732.007-7.098.007-.835.686-1.515 1.521-1.522h.014c.835.007 1.514.687 1.521 1.522.007 2.366.014 4.732.007 7.098l-.007.295c-.02 1.69.208 2.957.68 3.77.473.814 1.291 1.258 2.43 1.319.887.047 1.693-.102 2.328-.541.567-.392.912-1.004.97-1.864 0-.754-.319-1.446-.897-1.941-.616-.527-1.442-.824-2.456-.882a11.881 11.881 0 0 0-2.588.12l-.126-1.974a13.853 13.853 0 0 1 3.02-.142c1.464.084 2.703.531 3.583 1.291.922.797 1.395 1.892 1.33 3.082-.067 1.224-.689 2.275-1.752 2.964-.898.583-2.057.866-3.259.801-1.59-.086-2.844-.688-3.73-1.79-.662-.826-1.092-1.92-1.284-3.272-.761.45-1.324 1.04-1.634 1.75-.528 1.205-.557 3.185 1.09 4.798 1.442 1.414 3.177 2.025 5.8 2.045 2.91-.019 5.11-.934 6.54-2.717 1.339-1.668 2.03-4.078 2.057-7.164-.027-3.086-.718-5.496-2.057-7.164-1.43-1.781-3.63-2.695-6.54-2.717-4.406.031-7.2 2.055-8.304 6.015l-2.04-.569c.651-2.337 1.832-4.177 3.509-5.467C7.137.725 9.434.02 12.18 0h.014z" /></svg>
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
                <a href={socialLinks.email} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e nota final */}
        <div className="pt-4 pb-4 border-y border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-500">
            Este aplicativo não substitui consultas médicas. Sempre consulte seu médico ou profissional de saúde.
          </p>
        </div>
        <div className="pt-6 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 dark:text-slate-500">
            © {currentYear} GlicoSIM. Todos os direitos reservados.
          </p>
          <a
            href="https://status.goatech.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors"
          >
            Status dos Serviços
          </a>
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            Desenvolvido por {' '}
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              GOATECH
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
