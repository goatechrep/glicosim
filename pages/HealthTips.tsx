import React, { useEffect, useState } from 'react';
import { healthTipsService } from '../services/healthTipsService';
import { HealthTipArticle } from '../data/healthTips';

const HealthTipsPage: React.FC = () => {
  const [tips, setTips] = useState<HealthTipArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTips = async () => {
      setLoading(true);
      const data = await healthTipsService.getAll();
      setTips(data);
      setLoading(false);
    };
    loadTips();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-white uppercase leading-none">Dicas de Saúde</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Conteúdo educativo. No futuro, esta seção poderá ser alimentada por banco de dados.
        </p>
      </header>

      {loading ? (
        <div className="py-10 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Carregando dicas...</div>
      ) : tips.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center">
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sem conteúdo no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tips.map(tip => (
            <article key={tip.id} className="bg-white dark:bg-[#111121] rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{tip.category}</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{new Date(tip.publishedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">{tip.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{tip.summary}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tip.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthTipsPage;
