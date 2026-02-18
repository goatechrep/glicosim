import React, { useState, useEffect } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    periodo: string;
    dateStart: string;
    dateEnd: string;
  };
  onApply: (filters: { periodo: string; dateStart: string; dateEnd: string }) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!isOpen) return null;

  const periodos = ['Todos', 'Café da Manhã', 'Almoço', 'Jantar', 'Antes de Dormir'];

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = { periodo: 'Todos', dateStart: '', dateEnd: '' };
    setLocalFilters(clearedFilters);
    onApply(clearedFilters);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111121] rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-out translate-y-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" aria-hidden="true" />
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 id="filter-drawer-title" className="text-xl font-black text-slate-900 dark:text-white uppercase">
              Filtros
            </h3>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label="Fechar filtros"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Filtro de Período */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              {periodos.map(periodo => (
                <button
                  key={periodo}
                  onClick={() => setLocalFilters({ ...localFilters, periodo })}
                  className={`
                    py-3 px-4 rounded-xl text-sm font-bold transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500
                    ${localFilters.periodo === periodo
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }
                  `}
                  aria-pressed={localFilters.periodo === periodo}
                >
                  {periodo}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Data */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Intervalo de Datas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-date-start" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1 block">
                  Data Inicial
                </label>
                <input
                  id="filter-date-start"
                  type="date"
                  value={localFilters.dateStart}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateStart: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="filter-date-end" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1 block">
                  Data Final
                </label>
                <input
                  id="filter-date-end"
                  type="date"
                  value={localFilters.dateEnd}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateEnd: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClear}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Limpar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-black uppercase text-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* Safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  );
};

export default FilterDrawer;
