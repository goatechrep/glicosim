import React from 'react';
import { contactChannels } from '../data/contactChannels';

const ContactPage: React.FC = () => {
  return (
    <div className="animate-fade-in flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-[#111121] md:px-10 md:py-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-600 rotate-3 shadow-lg shadow-orange-500/20">
          <span className="material-symbols-outlined text-[34px] text-white">bloodtype</span>
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Glico<span className="text-orange-600">SIM</span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Entre em contato conosco atraves dos canais
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {contactChannels.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-900/40 dark:hover:bg-orange-950/20 dark:hover:text-orange-300"
            >
              <span className="material-symbols-outlined text-[18px]">{channel.icon}</span>
              {channel.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
