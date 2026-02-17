import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] p-7 animate-pulse" aria-label="Carregando...">
    <div className="flex items-center justify-between mb-6">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] p-8 animate-pulse" aria-label="Carregando gráfico...">
    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
    <div className="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3" aria-label="Carregando lista...">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-[#111121] rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    ))}
  </div>
);
