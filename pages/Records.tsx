
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
import { medicationService } from '../services/medicationService';
import { reminderService } from '../services/reminderService';
import { settingsService } from '../services/settingsService';

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
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [isClearingRecords, setIsClearingRecords] = useState(false);
  const [isInsertingTestRecords, setIsInsertingTestRecords] = useState(false);

  const [filterPeriodo, setFilterPeriodo] = useState<string>('Todos');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [doseValue, setDoseValue] = useState<string>('6');
  const [doseUnit, setDoseUnit] = useState<string>('UI');
  const [doseError, setDoseError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<GlucoseRecord>>({
    periodo: Periodo.CAFE_MANHA,
    medicamento: Medicamento.HUMALOG,
    antesRefeicao: 0,
    aposRefeicao: 0,
    dose: '6 UI',
    notes: '',
    data: new Date().toISOString().split('T')[0]
  });

  const [horario, setHorario] = useState<string>('08:00');

  const periodoHorarios = {
    [Periodo.CAFE_MANHA]: '08:00',
    [Periodo.ALMOCO]: '12:00',
    [Periodo.LANCHE]: '16:00',
    [Periodo.JANTAR]: '19:00',
    [Periodo.GLICEMIA_DEITAR]: '22:00'
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setEditingId(null);
      setFormData({
        periodo: Periodo.CAFE_MANHA,
        medicamento: Medicamento.HUMALOG,
        antesRefeicao: 100,
        dose: '6 UI',
        notes: '',
        data: new Date().toISOString().split('T')[0]
      });
      setDoseValue('6');
      setDoseUnit('UI');
      setIsModalOpen(true);
      navigate('/registros', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => { 
    loadRecords();
    setMedications(medicationService.getMedications());
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setMedications(medicationService.getMedications());
    }
  }, [isModalOpen]);

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

  const escapeHtml = (value: string): string => (
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  );

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

  // Exportar para JSON
  const exportToJSON = () => {
    if (filteredRecords.length === 0) {
      addToast("Nenhum registro para exportar.", "info");
      return;
    }

    const data = {
      paciente: user?.nome,
      email: user?.email,
      dataExportacao: new Date().toLocaleString('pt-BR'),
      registros: filteredRecords
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glicosim_registros_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("Exportação JSON concluída!");
  };

  // Exportar para Excel-like (CSV com formatação)
  const exportToExcel = () => {
    if (filteredRecords.length === 0) {
      addToast("Nenhum registro para exportar.", "info");
      return;
    }

    const headers = ["Data", "Periodo", "Glicemia (mg/dL)", "Medicamento", "Dose", "Notas"];
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    // Adicionar cabeçalho com info do paciente
    csvContent += `Paciente: ${user?.nome}\n`;
    csvContent += `Email: ${user?.email}\n`;
    csvContent += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    const rows = filteredRecords.map(r => [
      r.data.split('-').reverse().join('/'),
      r.periodo,
      r.antesRefeicao,
      r.medicamento,
      r.dose,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    csvContent += [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `glicosim_registros_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exportação Excel concluída!");
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

    const empty = { antes: '-', apos: '-', dose: '-' };
    type MealRow = { antes: string; apos: string; dose: string };
    type ReportRow = {
      dataISO: string;
      data: string;
      cafe: MealRow;
      almoco: MealRow;
      lanche: MealRow;
      jantar: MealRow;
      deitar: string;
      obs: string;
    };

    const byDate = new Map<string, ReportRow>();

    filteredRecords.forEach(record => {
      const dateISO = record.data;
      if (!byDate.has(dateISO)) {
        byDate.set(dateISO, {
          dataISO: dateISO,
          data: dateISO.split('-').reverse().join('/'),
          cafe: { ...empty },
          almoco: { ...empty },
          lanche: { ...empty },
          jantar: { ...empty },
          deitar: '-',
          obs: '-'
        });
      }

      const row = byDate.get(dateISO)!;
      const note = record.notes?.trim();
      if (note) {
        row.obs = row.obs === '-' ? note : `${row.obs} | ${note}`;
      }

      const filled = {
        antes: record.antesRefeicao != null ? String(record.antesRefeicao) : '-',
        apos: record.aposRefeicao != null ? String(record.aposRefeicao) : '-',
        dose: record.dose?.trim() ? record.dose : '-'
      };

      if (record.periodo === Periodo.CAFE_MANHA) row.cafe = filled;
      if (record.periodo === Periodo.ALMOCO) row.almoco = filled;
      if (record.periodo === Periodo.LANCHE) row.lanche = filled;
      if (record.periodo === Periodo.JANTAR) row.jantar = filled;
      if (record.periodo === Periodo.GLICEMIA_DEITAR) {
        row.deitar = record.aposRefeicao != null
          ? String(record.aposRefeicao)
          : String(record.antesRefeicao ?? '-');
      }
    });

    const amgRows = Array.from(byDate.values()).sort((a, b) => b.dataISO.localeCompare(a.dataISO));

    const htmlContent = `
      <html>
        <head>
          <title>Relatório AMG - GlicoSIM</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            @page { size: A4 landscape; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; color: #111827; background: white; margin: 0; }
            .header { margin-bottom: 12px; }
            .title { text-align: center; font-size: 16px; font-weight: 900; margin-bottom: 8px; }
            .meta { display: flex; justify-content: space-between; font-size: 10px; color: #374151; margin-bottom: 8px; gap: 8px; }
            .meta p { margin: 0; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            thead tr.group th { background: #7a7a7a; color: white; font-size: 9px; padding: 6px 4px; border: 1px solid #4b5563; text-align: center; }
            thead tr.sub th { background: #d1d5db; color: #111827; font-size: 8px; padding: 5px 3px; border: 1px solid #9ca3af; text-align: center; }
            tbody tr:nth-child(even) { background: #f3f4f6; }
            td { border: 1px solid #9ca3af; padding: 4px 3px; font-size: 8px; text-align: center; vertical-align: middle; page-break-inside: avoid; }
            td.obs { text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .date-col { width: 8%; }
            .metric-col { width: 5.4%; }
            .sleep-col { width: 5.8%; }
            .obs-col { width: 8.6%; }
            .footer { margin-top: 8px; font-size: 8px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Automonitoração da Glicemia Capilar (AMG)</div>
            <div class="meta">
              <p><strong>Paciente:</strong> ${escapeHtml(user?.nome || 'Não identificado')}</p>
              <p><strong>Email:</strong> ${escapeHtml(user?.email || '-')}</p>
              <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr class="group">
                <th rowspan="2" class="date-col">Dia/Mês/Ano</th>
                <th colspan="3">Café da Manhã</th>
                <th colspan="3">Almoço</th>
                <th colspan="3">Lanche</th>
                <th colspan="3">Jantar</th>
                <th rowspan="2" class="sleep-col">Glicemia ao deitar</th>
                <th rowspan="2" class="obs-col">Obs.</th>
              </tr>
              <tr class="sub">
                <th class="metric-col">Antes</th>
                <th class="metric-col">2h após</th>
                <th class="metric-col">Dose insulina (unidade)</th>
                <th class="metric-col">Antes</th>
                <th class="metric-col">2h após</th>
                <th class="metric-col">Dose insulina (unidade)</th>
                <th class="metric-col">Antes</th>
                <th class="metric-col">2h após</th>
                <th class="metric-col">Dose insulina (unidade)</th>
                <th class="metric-col">Antes</th>
                <th class="metric-col">2h após</th>
                <th class="metric-col">Dose insulina (unidade)</th>
              </tr>
            </thead>
            <tbody>
              ${amgRows.map(row => `
                <tr>
                  <td>${row.data}</td>
                  <td>${row.cafe.antes}</td>
                  <td>${row.cafe.apos}</td>
                  <td>${escapeHtml(row.cafe.dose)}</td>
                  <td>${row.almoco.antes}</td>
                  <td>${row.almoco.apos}</td>
                  <td>${escapeHtml(row.almoco.dose)}</td>
                  <td>${row.lanche.antes}</td>
                  <td>${row.lanche.apos}</td>
                  <td>${escapeHtml(row.lanche.dose)}</td>
                  <td>${row.jantar.antes}</td>
                  <td>${row.jantar.apos}</td>
                  <td>${escapeHtml(row.jantar.dose)}</td>
                  <td>${row.deitar}</td>
                  <td class="obs">${escapeHtml(row.obs)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Este relatório foi gerado através do ecossistema GlicoSIM.
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
    const selectedPeriodo = formData.periodo as Periodo | undefined;
    const isSleepPeriod = selectedPeriodo === Periodo.GLICEMIA_DEITAR;

    if (!formData.data || !selectedPeriodo) {
      addToast("Preencha data e período.", "error");
      return;
    }

    if (formData.antesRefeicao == null || Number.isNaN(Number(formData.antesRefeicao))) {
      addToast("Campo 'Antes' é obrigatório.", "error");
      return;
    }

    if (!isSleepPeriod && (formData.aposRefeicao == null || Number.isNaN(Number(formData.aposRefeicao)))) {
      addToast("Campo '2h após' é obrigatório.", "error");
      return;
    }

    if (!isSleepPeriod && !doseValue.trim()) {
      setDoseError("Informe a dose");
      addToast("Campo 'Dose' é obrigatório.", "error");
      return;
    }

    if (!isSleepPeriod) {
      const error = validateDose(doseValue, doseUnit);
      if (error) { setDoseError(error); return; }
    }

    const isDuplicate = records.some(record =>
      record.data === formData.data &&
      record.periodo === selectedPeriodo &&
      record.id !== editingId
    );
    if (isDuplicate) {
      addToast("Já existe registro para esta data e período.", "error");
      return;
    }

    const finalDose = isSleepPeriod ? '0 UI' : `${doseValue} ${doseUnit}`;
    const dataToSave = { ...formData, periodo: selectedPeriodo, dose: finalDose };

    try {
      let savedRecordId = editingId;
      if (editingId) {
        await mockService.updateRecord(editingId, dataToSave);
        addToast("Registro atualizado!");
      } else {
        const newRecord = await mockService.createRecord(dataToSave as any);
        savedRecordId = newRecord.id;
        addToast("Medição salva com sucesso!");
      }
      
      // Criar lembrete se 2h após não preenchido
      if (selectedPeriodo !== Periodo.GLICEMIA_DEITAR && formData.aposRefeicao == null && savedRecordId) {
        reminderService.createReminder(savedRecordId, dataToSave);
      }
      
      // Atualizar estoque de medicamentos
      if (formData.medicamento && formData.medicamento !== 'Nenhum' && selectedPeriodo !== Periodo.GLICEMIA_DEITAR) {
        const quantidade = parseFloat(doseValue.replace(',', '.'));
        const success = medicationService.decreaseStock(formData.medicamento, quantidade, doseUnit);
        if (!success) {
          addToast(`Aviso: Estoque de ${formData.medicamento} insuficiente`, 'info');
        }
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

  const handleToggleRecordSelection = (id: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedRecords.size === 0) {
      addToast("Selecione registros para deletar.", "info");
      return;
    }

    try {
      for (const id of selectedRecords) {
        await mockService.deleteRecord(id);
      }
      addToast(`${selectedRecords.size} registros removidos!`, "success");
      setShowDeleteMultipleModal(false);
      setSelectedRecords(new Set());
      await loadRecords();
    } catch (error) {
      addToast("Erro ao excluir registros.", "error");
    }
  };

  const handleClearAllRecords = async () => {
    if (records.length === 0) {
      addToast("Não há registros para limpar.", "info");
      return;
    }

    try {
      setIsClearingRecords(true);
      addToast("Limpando registros...");
      for (const record of records) {
        await mockService.deleteRecord(record.id);
      }
      addToast("Todos os registros foram removidos!", "success");
      setSelectedRecords(new Set());
      await loadRecords();
    } catch (error) {
      addToast("Erro ao limpar registros.", "error");
    } finally {
      setIsClearingRecords(false);
    }
  };

  const handleInsertTestRecords = async () => {
    try {
      setIsInsertingTestRecords(true);
      addToast("Inserindo dados de teste...");
      const inserted = await mockService.addTestRecords();
      addToast(`${inserted} registros de teste inseridos!`, "success");
      await loadRecords();
    } catch (error) {
      addToast("Erro ao inserir registros de teste.", "error");
    } finally {
      setIsInsertingTestRecords(false);
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
      const defaultDose = editingId ? (formData.dose || '6 UI') : '6 UI';
      const parsed = parseDoseString(defaultDose);
      setDoseValue(parsed.value);
      setDoseUnit(parsed.unit);
      setDoseError(null);
    }
  }, [isModalOpen, editingId]);

  return (
    <div className="animate-fade-in relative min-h-full space-y-6">
      {/* Floating Action Button for Desktop */}
      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            periodo: Periodo.CAFE_MANHA,
            medicamento: Medicamento.HUMALOG,
            antesRefeicao: 100,
            dose: '6 UI',
            notes: '',
            data: new Date().toISOString().split('T')[0]
          });
          setDoseValue('6');
          setDoseUnit('UI');
          setIsModalOpen(true);
        }}
        className="hidden md:flex fixed bottom-8 right-8 z-40 w-16 h-16 bg-orange-600 text-white rounded-full items-center justify-center border border-orange-500 active:scale-90 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Adicionar novo registro"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[10999] bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-none" />
      )}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[11000] pointer-events-none flex flex-col items-center justify-center gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 text-center min-w-[280px] animate-toast-in backdrop-blur-sm shadow-2xl ${
            t.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700 text-white' : 
            t.type === 'error' ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white' : 
            'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700 text-white'
          }`}>
            <span className="material-symbols-outlined text-5xl font-bold">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
            <span className="text-sm font-black uppercase tracking-wider">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-white uppercase leading-none">Registros de Glicemia</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Automonitoração de Glicemia Capilar (AMG)</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Mobile: Botões reorganizados */}
          <div className="sm:hidden flex gap-2 w-full">
            <button 
              onClick={exportToPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95"
              title="Gerar PDF"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>PDF</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title="Exportar CSV"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              <span>CSV</span>
            </button>
          </div>
          <div className="sm:hidden flex gap-2 w-full">
            <button 
              onClick={handleInsertTestRecords}
              disabled={isInsertingTestRecords || isClearingRecords}
              className="flex-1 flex items-center justify-center px-3 py-2.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
              title="Inserir dados de teste"
              aria-label={isInsertingTestRecords ? 'Inserindo dados de teste' : 'Inserir dados de teste'}
            >
              <span className={`material-symbols-outlined text-[16px] ${isInsertingTestRecords ? 'animate-spin' : ''}`}>rocket_launch</span>
            </button>
            <button 
              onClick={handleClearAllRecords}
              disabled={isClearingRecords || isInsertingTestRecords}
              className="flex-1 flex items-center justify-center px-3 py-2.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
              title="Limpar banco de registros"
              aria-label={isClearingRecords ? 'Limpando banco de registros' : 'Limpar banco de registros'}
            >
              <span className={`material-symbols-outlined text-[16px] ${isClearingRecords ? 'animate-pulse' : ''}`}>delete</span>
            </button>
            <button 
              onClick={exportToJSON}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title="Exportar JSON"
            >
              <span className="material-symbols-outlined text-[16px]">data_object</span>
              <span>JSON</span>
            </button>
            <button 
              onClick={exportToExcel}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title="Exportar Excel"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>XLS</span>
            </button>
          </div>
          {/* Desktop: Botões com texto */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={handleInsertTestRecords}
              disabled={isInsertingTestRecords || isClearingRecords}
              className="flex items-center justify-center px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
              title="Inserir dados de teste"
              aria-label={isInsertingTestRecords ? 'Inserindo dados de teste' : 'Inserir dados de teste'}
            >
              <span className={`material-symbols-outlined text-[16px] ${isInsertingTestRecords ? 'animate-spin' : ''}`}>rocket_launch</span>
            </button>
            <button 
              onClick={handleClearAllRecords}
              disabled={isClearingRecords || isInsertingTestRecords}
              className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
              title="Limpar banco de registros"
              aria-label={isClearingRecords ? 'Limpando banco de registros' : 'Limpar banco de registros'}
            >
              <span className={`material-symbols-outlined text-[16px] ${isClearingRecords ? 'animate-pulse' : ''}`}>delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop: Inline Filters */}
      <div className="hidden md:block space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              {showAdvancedSearch ? 'expand_less' : 'expand_more'}
            </span>
            {showAdvancedSearch ? 'Fechar ' : 'Abrir '} Pesquisa Avançada
          </button>
          
          <button
            onClick={() => window.location.hash = '#/ajuda?guide=insulin'}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            Guia de Insulina
          </button>

          {selectedRecords.size > 0 && (
            <button
              onClick={() => setShowDeleteMultipleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
              title={`Deletar ${selectedRecords.size} selecionados`}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span className="hidden lg:inline">Deletar {selectedRecords.size}</span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              title="Exportar como CSV"
            >
              <span className="material-symbols-outlined text-[14px]">table_view</span>
              <span className="hidden lg:inline">CSV</span>
            </button>
            <button 
              onClick={exportToJSON}
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
              title="Exportar como JSON"
            >
              <span className="material-symbols-outlined text-[14px]">data_object</span>
              <span className="hidden lg:inline">JSON</span>
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
              title="Exportar para Excel"
            >
              <span className="material-symbols-outlined text-[14px]">table_chart</span>
              <span className="hidden lg:inline">XLS</span>
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95"
              title="Gerar PDF"
            >
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              <span className="hidden lg:inline">PDF</span>
            </button>
          </div>
        </div>
        
        {showAdvancedSearch && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 flex-wrap gap-4 items-end animate-slide-up flex">
            <div className="flex-1 min-w-[180px] space-y-1.5">
              <label htmlFor="filter-periodo" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">Momento</label>
              <select 
                id="filter-periodo"
                value={filterPeriodo} 
                onChange={e => setFilterPeriodo(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs font-bold outline-none appearance-none dark:text-white focus:ring-2 focus:ring-orange-500"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500" 
              />
            </div>
            <div className="flex-1 min-w-[140px] space-y-1.5">
              <label htmlFor="filter-date-end-desktop" className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest ml-1">Até</label>
              <input 
                id="filter-date-end-desktop"
                type="date" 
                value={filterDateEnd} 
                onChange={e => setFilterDateEnd(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500" 
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}
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

      <div className="pb-32 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-16 text-center">
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
            <div className="hidden md:block bg-white dark:bg-[#111121] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest w-10">
                      <input 
                        type="checkbox"
                        checked={filteredRecords.length > 0 && selectedRecords.size === filteredRecords.length}
                        onChange={handleSelectAll}
                        className="w-5 h-5 cursor-pointer accent-orange-600"
                      />
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Período</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Atual</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">2h Após</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className={`group transition-colors ${selectedRecords.has(rec.id) ? 'bg-orange-50 dark:bg-orange-950/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          checked={selectedRecords.has(rec.id)}
                          onChange={() => handleToggleRecordSelection(rec.id)}
                          className="w-5 h-5 cursor-pointer accent-orange-600"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{rec.data.split('-').reverse().join('/')}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase">{rec.periodo}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-orange-600 dark:text-orange-400">{rec.antesRefeicao} <span className="text-[9px] text-slate-500 dark:text-slate-400 ml-1">mg/dL</span></td>
                      <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400">{rec.aposRefeicao ?? '-'} {rec.aposRefeicao != null ? <span className="text-[9px] text-slate-500 dark:text-slate-400 ml-1">mg/dL</span> : ''}</td>
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
          <div className="w-full max-w-sm bg-white dark:bg-[#111121] rounded-lg p-10 text-center animate-zoom-in border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Apagar Registro?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleConfirmDelete} className="w-full py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">Excluir Permanente</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 transition-all">Manter Registro</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteMultipleModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl animate-fade-in p-6">
          <div className="w-full max-w-sm bg-white dark:bg-[#111121] rounded-lg p-10 text-center animate-zoom-in border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Deletar {selectedRecords.size} Registros?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Esta ação não pode ser desfeita.</p>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleDeleteMultiple} className="w-full py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">Excluir Permanente</button>
              <button onClick={() => setShowDeleteMultipleModal(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-0">
          <div className="w-full max-w-lg bg-white dark:bg-[#111121] rounded-lg overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">{editingId ? 'Editar' : 'Novo'} Registro</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:text-red-500">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 pb-24 md:pb-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</label>
                  <select value={formData.periodo} onChange={e => { const p = e.target.value as Periodo; setFormData({...formData, periodo: p}); setHorario(periodoHorarios[p] || '08:00'); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none" required>
                    <option value={Periodo.CAFE_MANHA}>Café da Manhã</option>
                    <option value={Periodo.ALMOCO}>Almoço</option>
                    <option value={Periodo.LANCHE}>Lanche</option>
                    <option value={Periodo.JANTAR}>Jantar</option>
                    <option value={Periodo.GLICEMIA_DEITAR}>Ao Deitar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</label>
                <input type="time" value={horario} onChange={e => setHorario(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white" required />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Glicemia Atual (mg/dL)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="500" 
                  step="1"
                  value={formData.antesRefeicao ?? ''} 
                  onChange={e => {
                    if (e.target.value.length > 3) return;
                    const value = e.target.value;
                    setFormData({...formData, antesRefeicao: value === '' ? undefined : Number(value)});
                  }} 
                  onBlur={e => {
                    const val = Number(e.target.value);
                    const settings = settingsService.getSettings();
                    if (val >= settings.maxLimit) {
                      alert('⚠️ ATENÇÃO: Glicemia muito alta!\n\n💉 Lave bem as mãos e refaça o teste\n🏥 Se confirmar, procure ajuda médica\n\n🚨 Emergência:\n• Ambulância: 192\n• Resgate: 193');
                    } else if (val > 0 && val < settings.minLimit) {
                      alert('⚠️ ATENÇÃO: Glicemia muito baixa!\n\n🍬 Consuma açúcar ou suco imediatamente\n💉 Lave as mãos e refaça o teste\n🏥 Se confirmar, procure ajuda médica\n\n🚨 Emergência:\n• Ambulância: 192\n• Resgate: 193');
                    }
                  }}
                  className="w-full text-center text-5xl font-black bg-transparent border-none outline-none text-orange-600" 
                  required 
                  placeholder="0" 
                />
              </div>

              {formData.periodo !== Periodo.GLICEMIA_DEITAR && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Glicemia 2h Após (mg/dL)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="500" 
                    step="1"
                    value={formData.aposRefeicao ?? ''} 
                    onChange={e => {
                      if (e.target.value.length > 3) return;
                      const value = e.target.value;
                      setFormData({...formData, aposRefeicao: value === '' ? undefined : Number(value)});
                    }} 
                    onBlur={e => {
                      const val = Number(e.target.value);
                      const settings = settingsService.getSettings();
                      if (val >= settings.maxLimit) {
                        alert('⚠️ ATENÇÃO: Glicemia muito alta!\n\n💉 Lave bem as mãos e refaça o teste\n🏥 Se confirmar, procure ajuda médica\n\n🚨 Emergência:\n• Ambulância: 192\n• Resgate: 193');
                      } else if (val > 0 && val < settings.minLimit) {
                        alert('⚠️ ATENÇÃO: Glicemia muito baixa!\n\n🍬 Consuma açúcar ou suco imediatamente\n💉 Lave as mãos e refaça o teste\n🏥 Se confirmar, procure ajuda médica\n\n🚨 Emergência:\n• Ambulância: 192\n• Resgate: 193');
                      }
                    }}
                    className="w-full text-center text-5xl font-black bg-transparent border-none outline-none text-blue-600"
                    required
                    placeholder="0" 
                  />
                </div>
              )}

              {formData.periodo !== Periodo.GLICEMIA_DEITAR && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicamento</label>
                    <select value={formData.medicamento} onChange={e => setFormData({...formData, medicamento: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none">
                      <option value="">Selecione um medicamento</option>
                      {medications.map(med => (
                        <option key={med.id} value={med.nome}>
                          {med.nome} - {med.fabricante || 'Não informado'} ({med.quantidade} {med.unidade})
                        </option>
                      ))}
                      <option value="Nenhum">Nenhum</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => window.location.hash = '#/medicamentos'}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">medication</span>
                      Gerenciar Estoque
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dose</label>
                      <input type="text" value={doseValue} onChange={e => { setDoseValue(e.target.value); setDoseError(null); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white" placeholder="0" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</label>
                      <select value={doseUnit} onChange={e => { setDoseUnit(e.target.value); setDoseError(null); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none dark:text-white appearance-none">
                        <option value="UI">UI</option>
                        <option value="mg">mg</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                  </div>
                  {doseError && <p className="text-red-500 text-xs font-bold">{doseError}</p>}
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white resize-none" placeholder="Anotações adicionais..." />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <input type="checkbox" id="createAlert" className="w-5 h-5 accent-orange-600 cursor-pointer" />
                <label htmlFor="createAlert" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">Criar alerta para este registro</label>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-[#111121] pb-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[12px] uppercase rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-black text-[12px] uppercase rounded-xl hover:bg-orange-700 transition-all">Salvar Registro</button>
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
