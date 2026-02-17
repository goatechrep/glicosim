
import React, { useState, useEffect, useRef } from 'react';
import { mockService } from '../services/mockService';
import { parseVoiceCommand } from '../services/geminiService';
import { GlucoseRecord, Periodo, Medicamento } from '../types';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doseError, setDoseError] = useState('');
  const [formData, setFormData] = useState<Partial<GlucoseRecord>>({
    periodo: Periodo.CAFE_MANHA,
    medicamento: Medicamento.NENHUM,
    antesRefeicao: 100,
    dose: '0',
    notes: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const data = await mockService.getRecords();
    setRecords(data);
    setLoading(false);
  };

  const validateDose = (dose: string): boolean => {
    if (!dose || dose === '0' || dose === 'N/A') return true;
    // Regex for: numeric value followed by UI, mg, ml or co (tablets)
    const pattern = /^\d+(\s?)(ui|mg|ml|co)$/i;
    return pattern.test(dose.trim());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoseError('');

    if (formData.dose && !validateDose(formData.dose)) {
      setDoseError('Formato inválido. Use ex: 10ui, 500mg, 2ml ou 1co.');
      return;
    }

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
    if (window.confirm('Tem certeza que deseja remover este registro?')) {
      await mockService.deleteRecord(id);
      loadRecords();
    }
  };

  const handleEdit = (rec: GlucoseRecord) => {
    setFormData(rec);
    setEditingId(rec.id);
    setDoseError('');
    setIsModalOpen(true);
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceStatus('Ouvindo...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceStatus('Processando com IA...');
      
      const parsed = await parseVoiceCommand(transcript);
      setIsVoiceActive(false);
      
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          antesRefeicao: parsed.valor_glicemia || prev.antesRefeicao,
          periodo: (parsed.periodo as any) || prev.periodo,
          medicamento: (parsed.medicamento as any) || prev.medicamento,
          dose: parsed.dose || prev.dose,
          notes: parsed.notes || `${prev.notes || ''} (Capturado por voz: "${transcript}")`.trim()
        }));
        setIsModalOpen(true);
        setDoseError('');
      } else {
        alert('Não consegui entender o comando. Tente algo como: "Glicemia de 120 no café da manhã com 10 unidades de basal"');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error', event.error);
      setIsVoiceActive(false);
      setVoiceStatus('');
      if (event.error === 'not-allowed') {
        alert('Permissão de microfone negada.');
      }
    };

    recognition.onend = () => {
      // Don't clear status here so user sees "Processando"
    };

    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          for (const item of json) {
            await mockService.createRecord(item);
          }
          loadRecords();
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const headers = ['Data', 'Periodo', 'Medicamento', 'Glicemia', 'Dose', 'Notas'];
    const rows = records.map(r => [r.data, r.periodo, r.medicamento, r.antesRefeicao, r.dose, r.notes]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "glicosim_registros.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Histórico</h2>
          <p className="text-gray-500 text-sm">Gerencie todas as suas medições.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleVoiceCommand}
            disabled={isVoiceActive}
            className={`px-4 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-2 ${isVoiceActive ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white dark:bg-[#111] border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            {isVoiceActive ? `🎙️ ${voiceStatus}` : '🎙️ Comando IA'}
          </button>
          <label className="px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 font-bold text-xs uppercase cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            📂 Importar
            <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={exportCSV}
            className="px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 font-bold text-xs uppercase hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            📊 Exportar
          </button>
          <button 
            onClick={() => { 
              setEditingId(null); 
              setFormData({ 
                periodo: Periodo.CAFE_MANHA,
                medicamento: Medicamento.NENHUM,
                antesRefeicao: 100,
                dose: '0',
                notes: '', 
                data: new Date().toISOString().split('T')[0] 
              }); 
              setDoseError('');
              setIsModalOpen(true); 
            }}
            className="px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase hover:bg-blue-700 transition-all"
          >
            + Novo Registro
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Data</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Período</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Glicemia</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Medicamento</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Dose</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-xs font-bold uppercase text-gray-500 italic">Buscando dados...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-xs font-bold uppercase text-gray-500 italic">Nenhum registro encontrado.</td></tr>
            ) : records.map(rec => (
              <tr key={rec.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-4 text-xs font-bold font-mono">{rec.data.split('-').reverse().join('/')}</td>
                <td className="px-4 py-4 text-xs font-bold uppercase italic text-gray-400">{rec.periodo}</td>
                <td className="px-4 py-4">
                  <span className={`text-xl font-black italic ${rec.antesRefeicao > 100 ? 'text-red-500' : rec.antesRefeicao < 70 ? 'text-yellow-500' : 'text-blue-500'}`}>
                    {rec.antesRefeicao}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1">mg/dL</span>
                </td>
                <td className="px-4 py-4 text-xs font-medium uppercase tracking-tighter">{rec.medicamento}</td>
                <td className="px-4 py-4 text-xs font-medium font-mono">{rec.dose || '-'}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(rec)} className="p-2 hover:text-blue-500 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(rec.id)} className="p-2 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Drawer UI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#0a0a0a] border border-gray-800 shadow-2xl flex flex-col animate-slideRight">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">
                {editingId ? 'Editar Medição' : 'Novo Registro'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl hover:opacity-50 transition-opacity">×</button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data</label>
                  <input 
                    type="date" 
                    value={formData.data}
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Valor (mg/dL)</label>
                  <input 
                    type="number" 
                    value={formData.antesRefeicao}
                    onChange={e => setFormData({...formData, antesRefeicao: Number(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-xl font-black focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Período</label>
                <select 
                  value={formData.periodo}
                  onChange={e => setFormData({...formData, periodo: e.target.value as Periodo})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-blue-500 outline-none"
                >
                  {Object.values(Periodo).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Medicamento</label>
                  <select 
                    value={formData.medicamento}
                    onChange={e => setFormData({...formData, medicamento: e.target.value as Medicamento})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    {Object.values(Medicamento).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dose (UI, mg, ml, co)</label>
                  <input 
                    type="text" 
                    placeholder="ex: 10ui, 500mg, 2ml"
                    value={formData.dose}
                    onChange={e => {
                      setFormData({...formData, dose: e.target.value});
                      setDoseError('');
                    }}
                    className={`w-full bg-gray-50 dark:bg-gray-900 border p-3 text-sm outline-none transition-colors ${doseError ? 'border-red-500' : 'border-gray-200 dark:border-gray-800 focus:border-blue-500'}`}
                  />
                  {doseError && <p className="text-[10px] font-bold text-red-500 uppercase">{doseError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notas Adicionais</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-sm focus:border-blue-500 outline-none resize-none"
                  placeholder="Como você está se sentindo?"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR REGISTRO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
