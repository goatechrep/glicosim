
import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import { parseVoiceCommand } from '../services/geminiService';
import { GlucoseRecord, Periodo, Medicamento } from '../types';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GlucoseRecord>>({
    periodo: Periodo.CAFE_MANHA,
    medicamento: Medicamento.NENHUM,
    antesRefeicao: 100,
    dose: '0',
    notes: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await mockService.getRecords();
    setRecords(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await mockService.updateRecord(editingId, formData);
    } else {
      await mockService.createRecord(formData as any);
    }
    setIsModalOpen(false);
    setEditingId(null);
    loadRecords();
  };

  const openDeleteModal = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      setLoading(true);
      await mockService.deleteRecord(recordToDelete);
      setRecordToDelete(null);
      setIsDeleteModalOpen(false);
      await loadRecords();
    }
  };

  const startVoiceCapture = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Seu navegador não suporta reconhecimento de voz.");
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
          dose: parsed.dose || prev.dose,
          notes: parsed.notes || prev.notes
        }));
      }
    };
    recognition.start();
  };

  return (
    <div className="animate-fade-in relative min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">Registros</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gerencie seu histórico de medições glicêmicas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Registro
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:block gap-4">
        {loading && !isDeleteModalOpen ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sincronizando Banco</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl p-24 text-center">
             <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">history</span>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Ainda não há medições registradas.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111121] rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Período</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Valor</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dose</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map(rec => (
                    <tr key={rec.id} className="block md:table-row group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="block md:table-cell px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {rec.data.split('-').reverse().join('/')}
                          </span>
                        </div>
                      </td>
                      <td className="block md:table-cell px-8 py-0 md:py-5">
                        <span className="inline-flex px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                          {rec.periodo}
                        </span>
                      </td>
                      <td className="block md:table-cell px-8 py-5">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-black italic tracking-tighter ${rec.antesRefeicao > 140 ? 'text-amber-500' : 'text-orange-600'}`}>
                            {rec.antesRefeicao}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">mg/dL</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-8 py-5 text-sm font-bold text-slate-500">
                        {rec.dose || '-'}
                      </td>
                      <td className="block md:table-cell px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setFormData(rec); setEditingId(rec.id); setIsModalOpen(true); }}
                            className="w-9 h-9 flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-400 hover:text-orange-600 rounded-xl transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => openDeleteModal(rec.id)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 z-[40] active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* FORM MODAL - Z-INDEX CORRIGIDO PARA TOPO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in transition-all p-4">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#111121] rounded-t-4xl md:rounded-4xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up md:animate-zoom-in border border-slate-100 dark:border-slate-800"
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-orange-500/20">
                  <span className="material-symbols-outlined">{editingId ? 'edit_note' : 'add_circle'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none uppercase italic">
                    {editingId ? 'Editar Medição' : 'Novo Registro'}
                  </h3>
                  <p className="text-[10px] text-orange-600 mt-1 uppercase tracking-[0.2em] font-black">Dados Biométricos</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={startVoiceCapture}
                className={`w-full flex items-center justify-center gap-4 py-4 rounded-3xl border-2 border-dashed transition-all ${
                  isVoiceProcessing 
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-600 animate-pulse' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-orange-200 hover:bg-orange-50/30'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{isVoiceProcessing ? 'hearing' : 'mic_none'}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{isVoiceProcessing ? 'Ouvindo...' : 'Comando de Voz IA'}</span>
              </button>

              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-4xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Medição Glicêmica</span>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={formData.antesRefeicao} 
                    onChange={e => setFormData({...formData, antesRefeicao: Number(e.target.value)})}
                    className="w-40 text-center text-7xl font-black bg-transparent border-none outline-none text-orange-600 selection:bg-orange-100"
                    required 
                    autoFocus
                  />
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">mg/dL</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Evento</label>
                  <input 
                    type="date" 
                    value={formData.data} 
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Momento do Dia</label>
                  <select 
                    value={formData.periodo} 
                    onChange={e => setFormData({...formData, periodo: e.target.value as Periodo})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none dark:text-white"
                  >
                    {Object.values(Periodo).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Insulina/Med</label>
                  <select 
                    value={formData.medicamento} 
                    onChange={e => setFormData({...formData, medicamento: e.target.value as Medicamento})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none dark:text-white"
                  >
                    {Object.values(Medicamento).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dose Aplicada</label>
                  <input 
                    type="text" 
                    placeholder="ex: 12ui"
                    value={formData.dose} 
                    onChange={e => setFormData({...formData, dose: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações Rápidas</label>
                <textarea 
                  rows={3} 
                  placeholder="Como você está se sentindo?"
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Descartar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 px-6 bg-orange-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-500/30 transition-all active:scale-95"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL - Z-INDEX AINDA MAIOR PARA SOBREPOR TUDO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg animate-fade-in p-6">
          <div className="w-full max-w-sm bg-white dark:bg-[#111121] rounded-[2.5rem] shadow-2xl p-10 text-center animate-zoom-in border border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <span className="material-symbols-outlined text-5xl">warning</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Excluir?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
              Esta ação removerá permanentemente o registro. Você tem certeza absoluta disso?
            </p>
            <div className="flex flex-col gap-3 mt-10">
              <button 
                onClick={handleConfirmDelete}
                className="w-full py-5 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/30 active:scale-95 transition-all"
              >
                Confirmar Exclusão
              </button>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setRecordToDelete(null); }}
                className="w-full py-5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all"
              >
                Manter Registro
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RecordsPage;
