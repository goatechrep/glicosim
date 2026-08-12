
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { GlucoseRecord, Periodo, Medicamento } from '../types';
import { useAuth } from '../App';
import RecordCard from '../components/RecordCard';
import FilterDrawer from '../components/FilterDrawer';
import useDebounce from '../hooks/useDebounce';
import Button from '../components/Button';
import BaseModal from '../components/BaseModal';
import { activityService } from '../services/activityService';
import { medicationService } from '../services/medicationService';
import { reminderService } from '../services/reminderService';
import { settingsService } from '../services/settingsService';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const PERIOD_ORDER = [
  Periodo.CAFE_MANHA,
  Periodo.ALMOCO,
  Periodo.LANCHE,
  Periodo.JANTAR,
  Periodo.GLICEMIA_DEITAR
];

const getPeriodoRank = (periodo: Periodo) => {
  const rank = PERIOD_ORDER.indexOf(periodo);
  return rank === -1 ? PERIOD_ORDER.length : rank;
};

const sortRecordsAscending = (items: GlucoseRecord[]) => [...items].sort((a, b) => {
  const dateCmp = a.data.localeCompare(b.data);
  if (dateCmp !== 0) return dateCmp;
  return getPeriodoRank(a.periodo) - getPeriodoRank(b.periodo);
});

const RecordsPage: React.FC = () => {
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
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
  const [clearProgress, setClearProgress] = useState({ completed: 0, total: 0 });
  const [isInsertingTestRecords, setIsInsertingTestRecords] = useState(false);
  const [isTestMonthModalOpen, setIsTestMonthModalOpen] = useState(false);
  const [testRecordMonth, setTestRecordMonth] = useState(todayIso.slice(0, 7));

  const [filterPeriodo, setFilterPeriodo] = useState<string>('Todos');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateScope, setDateScope] = useState<'day' | 'month' | 'year'>('day');
  const [activeTimelineDate, setActiveTimelineDate] = useState(todayIso);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isTimelineAnimating, setIsTimelineAnimating] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [doseValue, setDoseValue] = useState<string>('6');
  const [doseUnit, setDoseUnit] = useState<string>('UI');
  const [doseError, setDoseError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<GlucoseRecord>>({
    periodo: Periodo.CAFE_MANHA,
    medicamento: '' as Medicamento | '',
    antesRefeicao: 0,
    aposRefeicao: 0,
    dose: '0',
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
        medicamento: '' as Medicamento | '',
        antesRefeicao: 100,
        dose: '0',
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
    const activeMonth = activeTimelineDate.slice(0, 7);
    const activeYear = activeTimelineDate.slice(0, 4);

    const visibleRecords = records.filter(rec => {
      const matchPeriodo = filterPeriodo === 'Todos' || rec.periodo === filterPeriodo;
      const matchDateStart = !filterDateStart || rec.data >= filterDateStart;
      const matchDateEnd = !filterDateEnd || rec.data <= filterDateEnd;
      const matchTimeline =
        dateScope === 'day'
          ? rec.data === activeTimelineDate
          : dateScope === 'month'
            ? rec.data.startsWith(activeMonth)
            : rec.data.startsWith(activeYear);
      const matchSearch = !debouncedSearch || 
        rec.notes?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rec.periodo.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchPeriodo && matchDateStart && matchDateEnd && matchTimeline && matchSearch;
    });

    return sortRecordsAscending(visibleRecords);
  }, [records, filterPeriodo, filterDateStart, filterDateEnd, dateScope, activeTimelineDate, debouncedSearch]);

  const displayedRecords = useMemo(
    () => filteredRecords.slice(0, visibleCount),
    [filteredRecords, visibleCount]
  );

  const hasMoreRecords = filteredRecords.length > displayedRecords.length;

  useEffect(() => {
    setVisibleCount(15);
    setSelectedRecords(new Set());
  }, [filterPeriodo, filterDateStart, filterDateEnd, dateScope, activeTimelineDate, debouncedSearch]);

  useEffect(() => {
    setIsTimelineAnimating(true);
    const timeout = window.setTimeout(() => setIsTimelineAnimating(false), 180);
    return () => window.clearTimeout(timeout);
  }, [activeTimelineDate, dateScope]);

  const formatDateLabel = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit' });
  };

  const formatMonthLabel = (iso: string) => {
    const [year, month] = iso.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => {
      const date = new Date(2026, index, 1);
      return {
        value: String(index + 1).padStart(2, '0'),
        label: date.toLocaleDateString('pt-BR', { month: 'long' }),
      };
    }),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = Number(activeTimelineDate.slice(0, 4));
    return Array.from({ length: 7 }, (_, index) => String(currentYear - 3 + index));
  }, [activeTimelineDate]);

  const shiftTimelineDate = (amount: number) => {
    const [year, month, day] = activeTimelineDate.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day);

    if (dateScope === 'day') {
      nextDate.setDate(nextDate.getDate() + amount);
    } else if (dateScope === 'month') {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + amount);
    }

    setActiveTimelineDate(nextDate.toISOString().split('T')[0]);
  };

  const timelineDates = useMemo(() => {
    const [year, month, day] = activeTimelineDate.split('-').map(Number);
    const centerDate = new Date(year, month - 1, day);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + index - 3);
      return date.toISOString().split('T')[0];
    });
  }, [activeTimelineDate]);

  const handleMonthChange = (month: string) => {
    const [year, , day] = activeTimelineDate.split('-');
    const nextDate = new Date(Number(year), Number(month) - 1, Number(day));
    setActiveTimelineDate(nextDate.toISOString().split('T')[0]);
    setDateScope('month');
  };

  const handleYearChange = (year: string) => {
    const [, month, day] = activeTimelineDate.split('-');
    const nextDate = new Date(Number(year), Number(month) - 1, Number(day));
    setActiveTimelineDate(nextDate.toISOString().split('T')[0]);
    setDateScope('year');
  };

  const getExportRecords = () => sortRecordsAscending(filteredRecords);

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
    const rows = getExportRecords().map(r => [
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
      registros: getExportRecords()
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
    
    const rows = getExportRecords().map(r => [
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

    getExportRecords().forEach(record => {
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

    const amgRows = Array.from(byDate.values()).sort((a, b) => a.dataISO.localeCompare(b.dataISO));

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
    const isNoMedication = formData.medicamento === Medicamento.NENHUM || formData.medicamento === 'Nenhum';
    const hasSelectedMedication = Boolean(formData.medicamento) && !isNoMedication;

    if (!formData.data || !selectedPeriodo) {
      addToast("Preencha data e período.", "error");
      return;
    }

    if (formData.antesRefeicao == null || Number.isNaN(Number(formData.antesRefeicao))) {
      addToast("Campo 'Antes' é obrigatório.", "error");
      return;
    }

    if (!isSleepPeriod && hasSelectedMedication && !doseValue.trim()) {
      setDoseError("Informe a dose");
      addToast("Campo 'Dose' é obrigatório.", "error");
      return;
    }

    if (!isSleepPeriod && hasSelectedMedication) {
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

    const finalDose = isSleepPeriod || isNoMedication || !hasSelectedMedication ? '0' : `${doseValue} ${doseUnit}`;
    const dataToSave = { ...formData, periodo: selectedPeriodo, dose: finalDose };

    try {
      let savedRecordId = editingId;
      if (editingId) {
        await mockService.updateRecord(editingId, dataToSave);
        activityService.logActivity({
          title: 'Registro atualizado',
          description: `${selectedPeriodo} em ${formData.data} foi ajustado para ${formData.antesRefeicao} mg/dL.`,
          icon: 'edit_note',
          accent: 'orange',
          category: 'record',
          metadata: { recordId: editingId },
        });
        addToast("Registro atualizado!");
      } else {
        const newRecord = await mockService.createRecord(dataToSave as any);
        savedRecordId = newRecord.id;
        activityService.logActivity({
          title: 'Registro criado',
          description: `${selectedPeriodo} salvo com ${formData.antesRefeicao} mg/dL em ${formData.data}.`,
          icon: 'water_drop',
          accent: 'orange',
          category: 'record',
          metadata: { recordId: newRecord.id },
        });
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
        activityService.logActivity({
          title: 'Registro removido',
          description: 'Um registro de glicemia foi apagado manualmente.',
          icon: 'delete',
          accent: 'red',
          category: 'record',
          metadata: { recordId: recordToDelete },
        });
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
    if (selectedRecords.size === displayedRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(displayedRecords.map(r => r.id)));
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedRecords.size === 0) {
      addToast("Selecione registros para deletar.", "info");
      return;
    }

    try {
      const deletedCount = selectedRecords.size;
      for (const id of selectedRecords) {
        await mockService.deleteRecord(id);
      }
      activityService.logActivity({
        title: 'Registros excluídos em lote',
        description: `${deletedCount} registros de glicemia foram removidos de uma vez.`,
        icon: 'delete_sweep',
        accent: 'red',
        category: 'record',
        metadata: { count: deletedCount },
      });
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
      setClearProgress({ completed: 0, total: records.length });
      for (const record of records) {
        await mockService.deleteRecord(record.id);
        setClearProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
      }
      activityService.logActivity({
        title: 'Histórico limpo',
        description: 'Todos os registros de glicemia foram removidos da conta.',
        icon: 'history_toggle_off',
        accent: 'red',
        category: 'record',
        metadata: { count: records.length },
      });
      addToast("Todos os registros foram removidos!", "success");
      setSelectedRecords(new Set());
      await loadRecords();
    } catch (error) {
      addToast("Erro ao limpar registros.", "error");
    } finally {
      setIsClearingRecords(false);
      setClearProgress({ completed: 0, total: 0 });
    }
  };

  const formatTestRecordMonthLabel = (monthISO: string) => {
    const [year, month] = monthISO.split('-').map(Number);
    if (!year || !month) return monthISO;
    return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleInsertTestRecords = async () => {
    if (!testRecordMonth) {
      addToast("Selecione o mês para gerar os dados.", "info");
      return;
    }

    try {
      setIsInsertingTestRecords(true);
      const monthLabel = formatTestRecordMonthLabel(testRecordMonth);
      addToast(`Inserindo dados de teste de ${monthLabel}...`);
      const inserted = await mockService.addTestRecords(testRecordMonth);
      activityService.logActivity({
        title: 'Dados de teste inseridos',
        description: `${inserted} registros de exemplo de ${monthLabel} foram adicionados ao histórico.`,
        icon: 'science',
        accent: 'violet',
        category: 'system',
        metadata: { count: inserted, month: testRecordMonth },
      });
      addToast(`${inserted} registros de teste inseridos!`, "success");
      setIsTestMonthModalOpen(false);
      setDateScope('month');
      setActiveTimelineDate(`${testRecordMonth}-01`);
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

  const isNoMedication = formData.medicamento === Medicamento.NENHUM || formData.medicamento === 'Nenhum';
  const hasSelectedMedication = Boolean(formData.medicamento) && !isNoMedication;

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
      const { parseVoiceCommand } = await import('../services/geminiService');
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
    <div className="animate-fade-in relative min-h-[720px] mb-10 space-y-6">
      {/* Floating Action Button for Desktop */}
      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            periodo: Periodo.CAFE_MANHA,
            medicamento: '' as Medicamento | '',
            antesRefeicao: 100,
            dose: '0',
            notes: '',
            data: new Date().toISOString().split('T')[0]
          });
          setDoseValue('6');
          setDoseUnit('UI');
          setIsModalOpen(true);
        }}
        className="hidden md:flex fixed bottom-8 right-8 z-[35] w-16 h-16 bg-orange-600 text-white rounded-full items-center justify-center border border-orange-500 active:scale-90 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Adicionar novo registro"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {toasts.length > 0 && createPortal(
        <>
          <div className="fixed inset-0 z-[3400] bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-none" />
          <div className="fixed top-1/2 left-1/2 z-[3410] flex -translate-x-1/2 -translate-y-1/2 pointer-events-none flex-col items-center justify-center gap-3">
            {toasts.map(t => (
              <div key={t.id} className={`pointer-events-auto flex min-w-[280px] flex-col items-center gap-3 rounded-2xl border-2 px-8 py-6 text-center shadow-2xl backdrop-blur-sm animate-toast-in ${
                t.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700 text-white' : 
                t.type === 'error' ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white' : 
                'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700 text-white'
              }`}>
                <span className="material-symbols-outlined text-5xl font-bold">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span>
                <span className="text-sm font-black uppercase tracking-wider">{t.message}</span>
              </div>
            ))}
          </div>
        </>,
        document.body
      )}

      {isClearingRecords && (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111121] px-6 py-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <span className="material-symbols-outlined animate-spin text-[30px]">progress_activity</span>
            </div>
            <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">Limpando registros</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Aguarde a exclusao completa do historico para fechar este aviso.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{ width: `${clearProgress.total > 0 ? (clearProgress.completed / clearProgress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {clearProgress.completed}/{clearProgress.total} removidos
            </p>
          </div>
        </div>
      )}

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
              onClick={() => setIsTestMonthModalOpen(true)}
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
              onClick={() => setIsTestMonthModalOpen(true)}
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

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111121] p-4 md:p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Filtro rápido</p>
            <h3 className="mt-1 text-sm font-black uppercase text-slate-900 dark:text-white">Linha do tempo</h3>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
              {dateScope === 'day' ? 'Dia' : dateScope === 'month' ? 'Mês' : 'Ano'}
            </p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredRecords.length} registro(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Mês</span>
            <select
              value={activeTimelineDate.slice(5, 7)}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Ano</span>
            <select
              value={activeTimelineDate.slice(0, 4)}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftTimelineDate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all hover:border-orange-300 hover:text-orange-600"
            aria-label={dateScope === 'day' ? 'Dia anterior' : dateScope === 'month' ? 'Mês anterior' : 'Ano anterior'}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <div className="flex-1 overflow-hidden">
            <div className={`flex min-w-full items-center justify-center transition-all duration-200 ease-out ${isTimelineAnimating ? 'translate-y-[2px] opacity-85' : 'translate-y-0 opacity-100'}`}>
              <div className="flex min-w-max items-center justify-center gap-2 px-1 sm:px-2">
              {timelineDates.map((date) => {
                const isActive = date === activeTimelineDate;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setActiveTimelineDate(date);
                      setDateScope('day');
                    }}
                    className={`min-w-[72px] sm:min-w-[88px] rounded-2xl border px-3 sm:px-4 py-3 text-center transition-all duration-200 ${
                      isActive
                        ? 'scale-[1.02] border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    <span className={`block text-[10px] font-black uppercase tracking-[0.18em] ${isActive ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span className="mt-1 block text-base sm:text-sm font-black uppercase text-center">
                      {formatDateLabel(date)}
                    </span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => shiftTimelineDate(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all hover:border-orange-300 hover:text-orange-600"
            aria-label={dateScope === 'day' ? 'Próximo dia' : dateScope === 'month' ? 'Próximo mês' : 'Próximo ano'}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="pb-0 md:pb-2">
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
              {displayedRecords.map(rec => (
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
                        checked={displayedRecords.length > 0 && selectedRecords.size === displayedRecords.length}
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
                  {displayedRecords.map(rec => (
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

            {hasMoreRecords && (
              <div className="my-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 15)}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-orange-700 shadow-lg shadow-orange-500/20"
                >
                  <span>Ver mais</span>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BaseModal
        isOpen={isTestMonthModalOpen}
        onClose={() => {
          if (!isInsertingTestRecords) {
            setIsTestMonthModalOpen(false);
          }
        }}
        panelClassName="max-w-sm max-h-[calc(100dvh-2rem)]"
        bodyClassName="overflow-y-auto px-6 pb-6 pt-6"
        overlayClassName="z-[3200] bg-slate-950/90 backdrop-blur-2xl p-4 md:p-6"
        title={<span className="uppercase">Gerar testes</span>}
        subtitle="Escolha o mes do lancamento antes de inserir o historico de teste."
        showCloseButton={!isInsertingTestRecords}
      >
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleInsertTestRecords();
          }}
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mes do lancamento
            </label>
            <input
              type="month"
              value={testRecordMonth}
              onChange={(event) => setTestRecordMonth(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all [color-scheme:dark] focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-950/40"
              required
              disabled={isInsertingTestRecords}
            />
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
            Os registros de exemplo serao gerados para todos os dias do mes selecionado.
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isInsertingTestRecords || !testRecordMonth}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] ${isInsertingTestRecords ? 'animate-spin' : ''}`}>
                {isInsertingTestRecords ? 'progress_activity' : 'rocket_launch'}
              </span>
              {isInsertingTestRecords ? 'Inserindo' : 'Gerar Lancamento'}
            </button>
            <button
              type="button"
              onClick={() => setIsTestMonthModalOpen(false)}
              disabled={isInsertingTestRecords}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        panelClassName="max-w-sm max-h-[calc(100dvh-2rem)] text-center"
        bodyClassName="overflow-y-auto px-6 pb-10 pt-6 md:px-10"
        overlayClassName="bg-slate-950/90 backdrop-blur-2xl p-4 md:p-6"
        title={<span className="uppercase">Apagar Registro?</span>}
        subtitle="Esta ação não pode ser desfeita."
      >
        <div className="space-y-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/20">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={handleConfirmDelete} className="w-full rounded-lg bg-red-600 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-700">Excluir Permanente</button>
            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Manter Registro</button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={showDeleteMultipleModal}
        onClose={() => setShowDeleteMultipleModal(false)}
        panelClassName="max-w-sm max-h-[calc(100dvh-2rem)] text-center"
        bodyClassName="overflow-y-auto px-6 pb-10 pt-6 md:px-10"
        overlayClassName="bg-slate-950/90 backdrop-blur-2xl p-4 md:p-6"
        title={<span className="uppercase">Deletar {selectedRecords.size} Registros?</span>}
        subtitle="Esta ação não pode ser desfeita."
      >
        <div className="space-y-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/20">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={handleDeleteMultiple} className="w-full rounded-lg bg-red-600 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-700">Excluir Permanente</button>
            <button onClick={() => setShowDeleteMultipleModal(false)} className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        overlayClassName="z-[3200] isolate items-end md:items-center p-0 md:p-6 bg-slate-950/92 backdrop-blur-xl"
        panelClassName="h-[100dvh] max-w-full rounded-none border-0 shadow-[0_32px_120px_rgba(15,23,42,0.42)] md:h-auto md:max-h-[calc(100dvh-2.5rem)] md:max-w-3xl md:rounded-[32px] md:border md:border-slate-200/70 dark:md:border-slate-800"
        headerClassName="shrink-0 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur md:px-8 md:py-5 dark:border-slate-800 dark:bg-[#111121]/95"
        bodyClassName="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-5 md:px-8 md:pb-8 md:pt-6"
        footerClassName="shrink-0 border-t border-slate-200/80 bg-white/96 px-5 py-4 backdrop-blur md:px-8 md:py-5 dark:border-slate-800 dark:bg-[#111121]/96"
        footer={
          <div className="flex gap-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-100 py-4 text-[12px] font-black uppercase text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Cancelar</button>
            <button form="record-form" type="submit" className="flex-1 rounded-2xl bg-orange-600 py-4 text-[12px] font-black uppercase text-white transition-all hover:bg-orange-700 shadow-lg shadow-orange-500/20">Salvar</button>
          </div>
        }
        eyebrow="Registro de glicemia"
        title={<span className="uppercase">{editingId ? 'Editar registro' : 'Novo registro'}</span>}
        subtitle="Preencha os dados abaixo para salvar a medicao com mais clareza e sem perder o contexto."
      >
            <form id="record-form" onSubmit={handleSave} className="space-y-6">
              <div className="space-y-6">
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
                    placeholder="0" 
                  />
                </div>
              )}

              {formData.periodo !== Periodo.GLICEMIA_DEITAR && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicamento</label>
                    <div className="relative">
                      <select
                        value={formData.medicamento}
                        onChange={e => {
                          const medicamento = e.target.value as Medicamento | '';
                          setFormData({ ...formData, medicamento });
                          setDoseError(null);
                          if (medicamento === Medicamento.NENHUM || medicamento === '') {
                            setDoseValue('0');
                          } else if (doseValue === '0') {
                            setDoseValue('6');
                          }
                        }}
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm font-bold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:focus:border-orange-500 dark:focus:ring-orange-950/40"
                      >
                        <option value="">Selecione um medicamento</option>
                        {medications.map(med => (
                          <option key={med.id} value={med.nome}>
                            {med.nome} - {med.fabricante || 'Não informado'} ({med.quantidade} {med.unidade})
                          </option>
                        ))}
                        <option value="Nenhum">Nenhum</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.location.hash = '#/medicamentos'}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">medication</span>
                      Gerenciar Estoque
                    </button>
                  </div>

                  {hasSelectedMedication && (
                    <>
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
              </div>
            </form>
      </BaseModal>

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
