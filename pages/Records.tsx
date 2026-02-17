
import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import { parseVoiceCommand } from '../services/geminiService';
import { GlucoseRecord, Periodo, Medicamento } from '../types';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este registro permanentemente?')) {
      await mockService.deleteRecord(id);
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Registros</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu histórico de medições glicêmicas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Registro
          </button>
        </div>
      </header>

      {/* Grid de Cards para Mobile / Tabela para Desktop */}
      <div className="grid grid-cols-1 md:block gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-400">Carregando seus dados...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
             <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
             <p className="text-slate-500 font-medium text-sm">Nenhum registro encontrado.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Data</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Período</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Valor</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Dose</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map(rec => (
                    <tr key={rec.id} className="block md:table-row group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="block md:table-cell px-6 py-4 md:py-5">
                        <div className="flex items-center gap-3">
                          <div className="md:hidden w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                             <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {rec.data.split('-').reverse().join('/')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="block md:table-cell px-6 py-0 md:py-5">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                          {rec.periodo}
                        </span>
                      </td>
                      <td className="block md:table-cell px-6 py-4 md:py-5">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-black ${rec.antesRefeicao > 140 ? 'text-orange-500' : 'text-orange-600'}`}>
                            {rec.antesRefeicao}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">mg/dL</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 md:py-5 text-sm font-medium text-slate-500">
                        {rec.dose || '-'}
                      </td>
                      <td className="block md:table-cell px-6 py-4 md:py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => { setFormData(rec); setEditingId(rec.id); setIsModalOpen(true); }}
                            className="p-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-slate-400 hover:text-orange-600 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(rec.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
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
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-500/40 z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* MODAL / BOTTOM SHEET REFACTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in transition-all">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#09090b] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-slide-up md:animate-zoom-in"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">{editingId ? 'edit_note' : 'add_circle'}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                    {editingId ? 'Editar Medição' : 'Novo Registro'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Glicemia</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Voice Assist Button */}
              <button
                type="button"
                onClick={startVoiceCapture}
                className={`w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-dashed transition-all ${
                  isVoiceProcessing 
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-600 animate-pulse' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-orange-200 hover:bg-orange-50/30'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{isVoiceProcessing ? 'hearing' : 'mic'}</span>
                <span className="text-sm font-bold">{isVoiceProcessing ? 'Processando voz...' : 'Preencher via comando de voz'}</span>
              </button>

              {/* Big Glicemy Input */}
              <div className="flex flex-col items-center justify-center py-4 bg-orange-50/30 dark:bg-orange-950/10 rounded-3xl border border-orange-100/50 dark:border-orange-900/20">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Valor da Glicemia</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={formData.antesRefeicao} 
                    onChange={e => setFormData({...formData, antesRefeicao: Number(e.target.value)})}
                    className="w-32 text-center text-6xl font-black bg-transparent border-none outline-none text-slate-900 dark:text-white"
                    required 
                    autoFocus
                  />
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">mg/dL</span>
                </div>
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span> Data
                  </label>
                  <input 
                    type="date" 
                    value={formData.data} 
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> Período
                  </label>
                  <select 
                    value={formData.periodo} 
                    onChange={e => setFormData({...formData, periodo: e.target.value as Periodo})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none"
                  >
                    {Object.values(Periodo).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">medication</span> Medicação
                  </label>
                  <select 
                    value={formData.medicamento} 
                    onChange={e => setFormData({...formData, medicamento: e.target.value as Medicamento})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none"
                  >
                    {Object.values(Medicamento).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">vaccines</span> Dose
                  </label>
                  <input 
                    type="text" 
                    placeholder="ex: 10ui"
                    value={formData.dose} 
                    onChange={e => setFormData({...formData, dose: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">notes</span> Notas Adicionais
                </label>
                <textarea 
                  rows={2} 
                  placeholder="Sentindo-se bem..."
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3.5 px-4 bg-orange-600 text-white font-bold text-sm rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adding custom animations to tailwind via style tag in case they aren't global */}
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
