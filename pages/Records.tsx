
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { parseVoiceCommand } from '../services/geminiService';
import { GlucoseRecord, Periodo, Medicamento } from '../types';
import { useAuth } from '../App';
import RecordCard from '../components/RecordCard';
import FilterDrawer from '../components/FilterDrawer';
import useDebounce from '../hooks/useDebounce';
import Button from '../components/Button';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const RecordsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [filterPeriodo, setFilterPeriodo] = useState<string>('Todos');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [doseValue, setDoseValue] = useState<string>('0');
  const [doseUnit, setDoseUnit] = useState<string>('UI');
  const [doseError, setDoseError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<GlucoseRecord>>({
    periodo: Periodo.CAFE_MANHA,
    medicamento: Medicamento.NENHUM,
    antesRefeicao: 100,
    dose: '0',
    notes: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setEditingId(null);
      setFormData({
        periodo: Periodo.CAFE_MANHA,
        medicamento: Medicamento.NENHUM,
        antesRefeicao: 100,
        dose: '0',
        notes: '',
        data: new Date().toISOString().split('T')[0]
      });
      setDoseValue('0');
      setDoseUnit('UI');
      setIsModalOpen(true);
      navigate('/registros', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await mockService.getRecords();
    setRecords(data);
    setLoading(false);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchPeriodo = filterPeriodo === 'Todos' || rec.periodo === filterPeriodo;
      const matchDateStart = !filterDateStart || rec.data >= filterDateStart;
      const matchDateEnd = !filterDateEnd || rec.data <= filterDateEnd;
      const matchSearch = !debouncedSearch || 
        rec.notes?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rec.periodo.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchPeriodo && matchDateStart && matchDateEnd && matchSearch;
    });
  }, [records, filterPeriodo, filterDateStart, filterDateEnd, debouncedSearch]);

  // Funcionalidade de Exportação CSV
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      addToast("Nenhum registro para exportar.", "info");
      return;
    }
    const headers = ["Data", "Periodo", "Glicemia (mg/dL)", "Medicamento", "Dose", "Notas"];
    const rows = filteredRecords.map(r => [
      r.data.split('-').reverse().join('/'),
      r.periodo,
      r.antesRefeicao,
      r.medicamento,
      r.dose,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `glicosim_registros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exportação CSV concluída!");
  };

  // Funcionalidade de Exportação PDF (Print Layout)
  const exportToPDF = () => {
    if (filteredRecords.length === 0) {
      addToast("Nenhum registro para exportar.", "info");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast("Erro ao abrir janela de impressão.", "error");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Relatório Glicêmico - GlicoSIM</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-weight: 900; font-size: 24px; color: #ea580c; text-transform: uppercase; letter-spacing: -0.05em; }
            .user-info { text-align: right; }
            .user-info p { margin: 0; font-size: 12px; font-weight: bold; color: #64748b; }
            h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.05em; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8fafc; text-align: left; padding: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .val { font-weight: 900; color: #ea580c; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GlicoSIM</div>
            <div class="user-info">
              <p>Paciente: ${user?.nome || 'Não identificado'}</p>
              <p>Email: ${user?.email || '-'}</p>
              <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <h1>Relatório de Monitoramento Glicêmico</h1>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Período</th>
                <th>Valor (mg/dL)</th>
                <th>Dose Aplicada</th>
                <th>Medicamento</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(r => `
                <tr>
                  <td>${r.data.split('-').reverse().join('/')}</td>
                  <td>${r.periodo}</td>
                  <td class="val">${r.antesRefeicao}</td>
                  <td>${r.dose || '-'}</td>
                  <td>${r.medicamento}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Este relatório foi gerado através do ecossistema GlicoSIM Premium Health.
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    addToast("Relatório PDF preparado!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateDose(doseValue, doseUnit);
    if (error) { setDoseError(error); return; }

    const finalDose = `${doseValue} ${doseUnit}`;
    const dataToSave = { ...formData, dose: finalDose };

    try {
      if (editingId) {
        await mockService.updateRecord(editingId, dataToSave);
        addToast("Registro atualizado!");
      } else {
        await mockService.createRecord(dataToSave as any);
        addToast("Medição salva com sucesso!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      await loadRecords();
    } catch (err) {
      addToast("Erro ao salvar", "error");
    }
  };

  const openDeleteModal = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        await mockService.deleteRecord(recordToDelete);
        addToast("Registro removido com sucesso!", "success");
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
        await loadRecords();
      } catch (error) {
        addToast("Erro ao excluir registro.", "error");
      }
    }
  };

  const validateDose = (val: string, unit: string) => {
    const num = parseFloat(val.replace(',', '.'));
    if (isNaN(num) || num < 0) return "Valor inválido";
    if (unit === 'UI' && num > 200) return "Dose alta";
    if (unit === 'mg' && num > 5000) return "Dose alta";
    return null;
  };

  const parseDoseString = (doseStr: string) => {
    const match = doseStr.match(/^(\d+[\.,]?\d*)\s*(UI|mg|ml|ui|UI)?$/i);
    if (match) {
      return { value: match[1], unit: (match[2] || 'UI').toUpperCase() };
    }
    return { value: doseStr || '0', unit: 'UI' };
  };

  const startVoiceCapture = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      addToast("Voz não suportada", "error");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsVoiceProcessing(true);
    recognition.onend = () => setIsVoiceProcessing(false);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsed = await parseVoiceCommand(transcript);
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          antesRefeicao: parsed.valor_glicemia || prev.antesRefeicao,
          periodo: (parsed.periodo as Periodo) || prev.periodo,
          medicamento: (parsed.medicamento as Medicamento) || prev.medicamento,
          notes: parsed.notes || prev.notes
        }));
        if (parsed.dose) {
          const { value, unit } = parseDoseString(parsed.dose);
          setDoseValue(value);
          setDoseUnit(unit);
        }
        addToast("Comando processado!");
      }
    };
    recognition.start();
  };

  useEffect(() => {
    if (isModalOpen) {
      const { value, unit } = parseDoseString(editingId ? formData.dose || '0' : '0');
      setDoseValue(value);
      setDoseUnit(unit);
      setDoseError(null);
    }
  }, [isModalOpen, editingId]);

  return (
    <div className="animate-fade-in relative min-h-full space-y-6">
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[10999] bg-slate-950/60 backdrop-blur-md animate-fade-in pointer-events-none" />
      )}
      <div className="fixed inset-0 z-[11000] pointer-events-none flex flex-col items-center justify-center gap-4">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-4 px-10 py-6 rounded-[2.5rem] shadow-2xl border animate-toast-in ${
            t.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
            t.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
            'bg-slate-900 border-slate-700 text-white'
          }`}>
            <span className="material-symbols-outlined text-3xl">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
            <span className="text-lg font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">Registros</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle sua saúde com precisão absoluta.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            Exportar CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Gerar PDF
          </button>
        </div>
      </header>

      {/* Mobile: Filter Button */}
      <div className="md:hidden space-y-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowFilterDrawer(true)}
          leftIcon={<span className="material-symbols-outlined text-[20px]">filter_list</span>}
          className="w-full"
        >
          Filtrar Registros
        </Button>
        
        {/* Search input */}
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar nos registros..."
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          aria-label="Buscar registros"
        />
      </div>

      {/* Desktop: Inline Filters */}
      <div className="hidden md:flex bg-white dark:bg-[#111121] p-5 rounded-4xl border border-slate-200 dark:border-slate-800 flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px] space-y-1.5">
          <label htmlFor="filter-periodo" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">Momento</label>
          <select 
            id="filter-periodo"
            value={filterPeriodo} 
            onChange={e => setFilterPeriodo(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none appearance-none dark:text-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="Todos">Todos os Períodos</option>
            {Object.values(Periodo).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px] space-y-1.5">
          <label htmlFor="filter-date-start-desktop" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">De</label>
          <input 
            id="filter-date-start-desktop"
            type="date" 
            value={filterDateStart} 
            onChange={e => setFilterDateStart(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500" 
          />
        </div>
        <div className="flex-1 min-w-[140px] space-y-1.5">
          <label htmlFor="filter-date-end-desktop" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">Até</label>
          <input 
            id="filter-date-end-desktop"
            type="date" 
            value={filterDateEnd} 
            onChange={e => setFilterDateEnd(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500" 
          />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label htmlFor="search-desktop" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">Buscar</label>
          <input
            id="search-desktop"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={{ periodo: filterPeriodo, dateStart: filterDateStart, dateEnd: filterDateEnd }}
        onApply={(filters) => {
          setFilterPeriodo(filters.periodo);
          setFilterDateStart(filters.dateStart);
          setFilterDateEnd(filters.dateEnd);
        }}
      />

      <div className="pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl p-16 text-center">
             <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sem registros encontrados.</p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              {filteredRecords.map(rec => (
                <RecordCard
                  key={rec.id}
                  record={rec}
                  onEdit={() => { setFormData(rec); setEditingId(rec.id); setIsModalOpen(true); }}
                  onDelete={() => openDeleteModal(rec.id)}
                />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block bg-white dark:bg-[#111121] rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Período</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{rec.data.split('-').reverse().join('/')}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase">{rec.periodo}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-orange-600 dark:text-orange-400">{rec.antesRefeicao} <span className="text-[9px] text-slate-500 dark:text-slate-400 ml-1">mg/dL</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => { setFormData(rec); setEditingId(rec.id); setIsModalOpen(true); }} 
                            className="w-9 h-9 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-400 hover:text-orange-600 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                            aria-label={`Editar registro de ${rec.data}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => openDeleteModal(rec.id)} 
                            className="w-9 h-9 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            aria-label={`Excluir registro de ${rec.data}`}
                          >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl animate-fade-in p-6">
          <div className="w-full max-w-sm bg-white dark:bg-[#111121] rounded-[3rem] p-10 text-center animate-zoom-in border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Apagar Registro?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleConfirmDelete} className="w-full py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/30">Excluir Permanente</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-50 dark:bg-slate-900 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl">Manter Registro</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111121] rounded-4xl shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">{editingId ? 'Editar' : 'Novo'} Registro</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:text-red-500">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Glicemia (mg/dL)</label>
                <input type="number" value={formData.antesRefeicao} onChange={e => setFormData({...formData, antesRefeicao: Number(e.target.value)})} className="w-full text-center text-6xl font-black bg-transparent border-none outline-none text-orange-600" required autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</label>
                  <select value={formData.periodo} onChange={e => setFormData({...formData, periodo: e.target.value as Periodo})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none">
                    {Object.values(Periodo).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-orange-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-orange-500/20">Salvar Dados</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in { 0% { opacity: 0; transform: scale(0.6) translateY(50px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1.3) forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RecordsPage;
