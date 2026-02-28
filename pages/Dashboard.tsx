
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseService } from '../services/supabaseService';
import { dataSyncService } from '../services/dataSyncService';
import { medicationService } from '../services/medicationService';
import { reminderService } from '../services/reminderService';
import { GlucoseRecord } from '../types';
import { useAuth } from '../App';
import { SkeletonCard, SkeletonChart } from '../components/SkeletonCard';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { getAdSenseBlock } from '../data/adsense';
import { getPlanById, getFormattedPrice } from '../data/plans';
import { getBannersForPage } from '../data/banners';
import { healthTipsService } from '../services/healthTipsService';
import { HealthTipArticle } from '../data/healthTips';

const getGlycemiaStatus = (value: number) => {
  if (value > 180) return { label: 'Muito Alta', color: 'text-red-600 dark:text-red-400' };
  if (value > 140) return { label: 'Alta', color: 'text-amber-600 dark:text-amber-400' };
  if (value < 70) return { label: 'Baixa', color: 'text-blue-600 dark:text-blue-400' };
  return { label: 'Normal', color: 'text-emerald-600 dark:text-emerald-400' };
};

const parseISODate = (iso: string): Date | null => {
  if (!iso || typeof iso !== 'string') return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDateBR = (iso: string) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString('pt-BR');
};

const normalizeDateKey = (raw: string): string | null => {
  if (!raw || typeof raw !== 'string') return null;
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

const getTipCategoryLabel = (category: HealthTipArticle['category']) => {
  switch (category) {
    case 'hidratacao': return 'Hidratação';
    case 'alimentacao': return 'Alimentação';
    case 'atividade': return 'Atividade';
    case 'monitoramento': return 'Monitoramento';
    case 'bem-estar': return 'Bem-estar';
    default: return 'Saúde';
  }
};

const getTipCategoryClasses = (category: HealthTipArticle['category']) => {
  switch (category) {
    case 'hidratacao':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'alimentacao':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'atividade':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'monitoramento':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300';
    case 'bem-estar':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [lowStockMeds, setLowStockMeds] = useState<any[]>([]);
  const [dueReminders, setDueReminders] = useState<any[]>([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<any>(null);
  const [aposRefeicaoValue, setAposRefeicaoValue] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [healthTickerItems, setHealthTickerItems] = useState<HealthTipArticle[]>([]);
  const banners = getBannersForPage('dashboard');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedSync = localStorage.getItem('glicosim_last_sync');
    if (savedSync) setLastSync(savedSync);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  useEffect(() => {
    const loadHealthTicker = async () => {
      const tips = await healthTipsService.getAll();
      setHealthTickerItems(tips);
    };
    loadHealthTicker();
  }, []);

  const handleSync = async () => {
    if (!isOnline || user?.plano !== 'PRO' || syncing || !user?.id) return;
    setSyncing(true);
    try {
      const backup = dataSyncService.getLocalBackup(user.id);
      if (backup) {
        await dataSyncService.syncToSupabase(user.id, backup);
      }
      const now = new Date().toLocaleString('pt-BR');
      localStorage.setItem('glicosim_last_sync', now);
      setLastSync(now);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const loadData = useCallback(async () => {
    const s = await dataSyncService.getDashboardStats();
    const r = await dataSyncService.getRecords();
    const lowStock = medicationService.getLowStockMedications();
    const reminders = reminderService.getDueReminders();
    setStats(s);
    setRecords(r);
    setLowStockMeds(lowStock);
    setDueReminders(reminders);

    if (reminders.length > 0 && !reminderModalOpen) {
      setCurrentReminder(reminders[0]);
      setReminderModalOpen(true);
    }

    setLoading(false);
  }, [reminderModalOpen]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSaveReminder = async () => {
    if (currentReminder && aposRefeicaoValue > 0) {
      await dataSyncService.saveRecord({ ...currentReminder.recordData, aposRefeicao: aposRefeicaoValue });
      reminderService.deleteReminder(currentReminder.id);
      setReminderModalOpen(false);
      setCurrentReminder(null);
      setAposRefeicaoValue(0);
      await loadData();
    }
  };

  const handleSkipReminder = () => {
    if (currentReminder) {
      reminderService.deleteReminder(currentReminder.id);
      setReminderModalOpen(false);
      setCurrentReminder(null);
      setAposRefeicaoValue(0);
    }
  };

  const periodOptions = useMemo(() => [
    { value: '7d' as const, label: '7 dias', days: 7 },
    { value: '30d' as const, label: '30 dias', days: 30 },
    { value: '90d' as const, label: '90 dias', days: 90 },
  ], []);

  const chartData = useMemo(() => {
    const days = periodOptions.find(p => p.value === period)?.days || 7;
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const grouped = new Map<string, number[]>();
    records.forEach((record) => {
      if (typeof record?.antesRefeicao !== 'number') return;
      const dateKey = normalizeDateKey(record.data);
      if (!dateKey) return;
      const recordDate = parseISODate(dateKey);
      if (!recordDate) return;
      if (recordDate < startDate || recordDate > endDate) return;
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey)!.push(record.antesRefeicao);
    });

    let sortedDates = Array.from(grouped.keys()).sort((a, b) => {
      const da = parseISODate(a)?.getTime() || 0;
      const db = parseISODate(b)?.getTime() || 0;
      return da - db;
    });
    if (sortedDates.length === 0) {
      // fallback quando nao ha dados no intervalo atual: usa os ultimos dias com registro
      records.forEach((record) => {
        if (typeof record?.antesRefeicao !== 'number') return;
        const dateKey = normalizeDateKey(record.data);
        if (!dateKey) return;
        if (!grouped.has(dateKey)) grouped.set(dateKey, []);
        grouped.get(dateKey)!.push(record.antesRefeicao);
      });
      sortedDates = Array.from(grouped.keys()).sort((a, b) => {
        const da = parseISODate(a)?.getTime() || 0;
        const db = parseISODate(b)?.getTime() || 0;
        return da - db;
      }).slice(-days);
    }

    const tempRows = sortedDates.map((dateISO) => {
      const values = grouped.get(dateISO) || [];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((acc, value) => acc + value, 0);
      const avgRaw = sum / values.length;
      const avg = Math.round(avgRaw);

      return {
        dateISO,
        name: formatDateBR(dateISO),
        val: avg,
        sum,
        min,
        max,
        count: values.length
      };
    });

    const periodTotals = tempRows.reduce(
      (acc, row) => {
        acc.sum += row.sum;
        acc.count += row.count;
        return acc;
      },
      { sum: 0, count: 0 }
    );

    const periodAvg = periodTotals.count
      ? Math.round(periodTotals.sum / periodTotals.count)
      : 0;

    return tempRows.map(row => ({
      ...row,
      periodAvg,
      deltaPeriod: row.val - periodAvg
    }));
  }, [records, period, periodOptions]);

  const chartInsights = useMemo(() => {
    if (!chartData.length) return null;
    const totals = chartData.reduce(
      (acc, point: any) => {
        acc.sum += point.sum;
        acc.count += point.count;
        return acc;
      },
      { sum: 0, count: 0 }
    );
    const values = chartData.map(point => point.val);
    const avg = totals.count ? Math.round(totals.sum / totals.count) : 0;
    return {
      avg,
      max: Math.max(...values),
      min: Math.min(...values),
      days: chartData.length
    };
  }, [chartData]);

  const chartRangeLabel = useMemo(() => {
    if (!chartData.length) return 'Sem dados no período selecionado';
    const first = chartData[0]?.dateISO;
    const last = chartData[chartData.length - 1]?.dateISO;
    const selectedDays = periodOptions.find(p => p.value === period)?.days || 0;
    if (!first || !last) return 'Sem dados no período selecionado';
    return `Período carregado: ${formatDateBR(first)} até ${formatDateBR(last)} • ${chartData.length}/${selectedDays} dias com dados`;
  }, [chartData, period, periodOptions]);

  if (loading) return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <SkeletonChart />
        </div>
        <div className="md:col-span-4">
          <SkeletonChart />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/** Avisos para instalar App*/}
      <PWAInstallPrompt mode="banner" />
      <div className="flex items-center justify-between">
        {/* Boas vindas ao usuário */}
        <div className="flex items-center gap-4 animate-slide-up-subtle">
          {user?.foto && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900/30">
              <img src={user.foto} alt={user.nome} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Olá, <span className="text-orange-600">{user?.nome?.split(' ')[0] || 'Usuário'}!</span></h2>
              <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded ${user?.plano === 'PRO' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {user?.plano}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.plano === 'PRO' && lastSync ? `Última sincronização: ${lastSync}` : 'Atualize para o PRO para sincronizar seus dados na nuvem'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop: Badge completo */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border ${isOnline && user?.plano === 'PRO' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20' : 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-100 dark:border-red-900/20'}`}>
            <span className="material-symbols-outlined text-[14px]">{isOnline ? 'wifi' : 'wifi_off'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{isOnline && user?.plano === 'PRO' ? 'Sincronizado' : 'Offline'}</span>
          </div>
          {/* Mobile: Apenas ícone */}
          <div className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full border-2 ${isOnline && user?.plano === 'PRO' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <span className={`material-symbols-outlined text-[18px] ${isOnline && user?.plano === 'PRO' ? 'text-emerald-500' : 'text-red-500'}`}>{isOnline ? 'wifi' : 'wifi_off'}</span>
          </div>
          {/* Botão de Sincronizar */}
          {user?.plano === 'PRO' && (
            <button
              onClick={handleSync}
              disabled={!isOnline || syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border font-black text-[10px] uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-100 dark:border-red-900/20 opacity-50 cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined text-[16px] ${syncing ? 'animate-spin' : ''}">{syncing ? 'sync' : 'cloud_sync'}</span>
              <span className="hidden md:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          )}
        </div>
      </div>

      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">Estoque Baixo de Medicamentos</h3>
            </div>
            <NavLink to="/medicamentos" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">Ver Estoque</NavLink>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-3 animate-slide-horizontal">
              {lowStockMeds.map(m => (
                <div key={m.id} className="flex-shrink-0 bg-white dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-800 min-w-[200px]">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {m.nome}: {m.quantidade} {m.unidade}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">Limite: {m.limiteEstoque}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {dueReminders.length > 0 && !reminderModalOpen && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">schedule</span>
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Lembretes Pendentes</h3>
            </div>
            <button onClick={() => { setCurrentReminder(dueReminders[0]); setReminderModalOpen(true); }} className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline">Ver Agora</button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-3 animate-slide-horizontal">
              {dueReminders.map(r => (
                <div key={r.id} className="flex-shrink-0 bg-white dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800 min-w-[200px]">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    {r.recordData.periodo}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-500">Medir glicemia 2h após</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats.alerts && stats.alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">notifications_active</span>
              <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Alertas Pendentes</h3>
            </div>
            <NavLink to="/alertas" className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline">Ver Todos</NavLink>
          </div>
          <p className="text-sm font-bold text-red-700 dark:text-red-400">{stats.alerts.length} alerta(s) requer(em) sua atenção</p>
        </div>
      )}

      {/* Banner de Avisos / Propaganda em Slide */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="relative overflow-hidden rounded-2xl h-64 md:h-44">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-500 ${index === currentBannerIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
            >
              <div className={`bg-gradient-to-br ${banner.gradient} rounded-2xl p-4 md:p-6 text-white h-full relative`}>
                <div className="relative z-10 h-full flex flex-col pr-8 pb-10 md:pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-2xl">{banner.icon}</span>
                    {banner.badge && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase mb-1">{banner.title}</h3>
                  <p className={`${banner.textColor} text-xs md:text-sm mb-3 md:mb-4 leading-relaxed line-clamp-3 md:line-clamp-none`}>{banner.description}</p>
                  <button
                    onClick={() => window.location.hash = banner.buttonLink}
                    className="mt-auto self-start px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase rounded-lg hover:bg-slate-50 transition-all shadow-lg z-30"
                  >
                    {banner.buttonText}
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}
          </div>
          <NavLink
            to="/dicas-saude"
            className="group block rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-white/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
                  Dicas de saúde em destaque
                </p>
                <div className="relative overflow-hidden">
                  <div className="health-marquee-track">
                    {[0, 1].map((loopIndex) => (
                      <span className="health-marquee-row" aria-hidden={loopIndex === 1 ? 'true' : undefined} key={`ticker-loop-${loopIndex}`}>
                        {(healthTickerItems.length > 0 ? healthTickerItems : [{
                          id: 'fallback',
                          slug: 'fallback',
                          title: 'Hidratação',
                          summary: 'Beba mais água para ter uma vida saudável. Clique aqui e saiba mais.',
                          content: '',
                          category: 'hidratacao' as const,
                          publishedAt: '2026-01-01'
                        }]).map((tip) => (
                          <span className="health-marquee-item" key={`${loopIndex}-${tip.id}`}>
                            <span className={`health-marquee-chip ${getTipCategoryClasses(tip.category)}`}>
                              {getTipCategoryLabel(tip.category)}
                            </span>
                            <span className="health-marquee-text">
                              {tip.title}: {tip.summary}
                            </span>
                          </span>
                        ))}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">arrow_forward</span>
            </div>
          </NavLink>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Propaganda</p>
            <div className="w-[300px] max-w-full h-[200px] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-slate-400 text-xs p-4">Anúncio 300x200</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card title="Glicemia Média" value={`${stats.average}`} unit="mg/dL" icon="insights" trend={stats.average > 120 ? 'Alta' : 'Estável'} />
        <Card title="Na Média" value={`${Math.min(100, Math.max(0, 100 - (stats.average > 120 ? (stats.average - 120) / 2 : 0)))}%`} unit="" icon="check_circle" color="text-emerald-500 dark:text-emerald-400" />
        <Card title="Atual" value={`${stats.lastGlicemy}`} unit="mg/dL" icon="timer" />
        <Card title="Alertas" value={`${stats.alerts?.length || 0}`} unit="ativos" icon="notifications" color="text-orange-500 dark:text-orange-400" />
      </div>

      {user?.plano !== 'PRO' && (() => {
        const proPlan = getPlanById('PRO');
        return (
          <>
            {/* Mobile: Banner Upgrade PRO */}
            <div className="md:hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => window.location.hash = '#/pro'}>
              <div className="relative z-10 text-center">
                <h3 className="text-[20px] font-black uppercase mb-2">Atualize para {proPlan?.nome}</h3>
                <p className="text-orange-100 mb-4 text-[14px]">{proPlan?.descricao}</p>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-3xl font-black">{getFormattedPrice(proPlan!)}</span>
                  <span className="text-orange-200">/{proPlan?.periodo}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-black text-xs uppercase rounded-lg hover:bg-orange-50 transition-all">
                  <span>Conhecer Plano {proPlan?.nome}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            {/* Desktop: AdSense */}
            <div className="hidden md:block bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest">Espaço Publicitário - Google AdSense</p>
              <div className="mt-4 h-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-sm">Anúncio {getAdSenseBlock('dashboard-before-chart')?.format}</span>
              </div>
            </div>
          </>
        );
      })()}

      <div className="rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Tendência da Glicemia</h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {chartRangeLabel}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
            {periodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`
                  px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1
                  ${period === option.value
                    ? 'bg-white dark:bg-slate-700 text-orange-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }
                `}
                aria-label={`Mostrar dados de ${option.label}`}
                aria-pressed={period === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="h-[250px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" opacity={0.3} className="dark:opacity-10" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                domain={[0, 300]}
              />
              <Tooltip
                cursor={{ stroke: '#f97316', strokeOpacity: 0.25, strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
                  padding: '8px 10px',
                  minWidth: '180px'
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as any;
                  const status = getGlycemiaStatus(point.val);

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 shadow-2xl p-2 min-w-[180px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{point.name}</p>
                      <div className="mt-1.5 flex items-baseline justify-between gap-2">
                        <p className="text-base font-black text-orange-600">{point.val} <span className="text-[10px] text-slate-500">mg/dL</span></p>
                        <p className={`text-[10px] font-black ${status.color}`}>{status.label}</p>
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <p className="text-slate-600">Mín: <span className="font-black text-slate-900">{point.min}</span></p>
                        <p className="text-slate-600">Máx: <span className="font-black text-slate-900">{point.max}</span></p>
                        <p className="text-slate-600">Medições: <span className="font-black text-slate-900">{point.count}</span></p>
                        <p className="text-slate-600">Vs média período: <span className={`font-black ${point.deltaPeriod > 0 ? 'text-red-600' : point.deltaPeriod < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>{point.deltaPeriod > 0 ? `+${point.deltaPeriod}` : point.deltaPeriod} mg/dL</span></p>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#f97316"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#orangeGrad)"
                dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff', fill: '#f97316' }}
              />
            </AreaChart>
            </ResponsiveContainer>
          </div>
          {chartInsights && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Média Ponderada</p>
                <p className="text-sm font-black text-orange-600">{chartInsights.avg} mg/dL</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Maior Média Dia</p>
                <p className="text-sm font-black text-red-600">{chartInsights.max} mg/dL</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Menor Média Dia</p>
                <p className="text-sm font-black text-emerald-600">{chartInsights.min} mg/dL</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dias no Gráfico</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{chartInsights.days}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 pb-24 md:pb-0">
        <div className="rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Medicamentos</h3>
            <NavLink
              to="/medicamentos"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-2 py-1"
              aria-label="Ver todos os medicamentos"
              title="Ver todos os medicamentos"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_outward</span>
            </NavLink>
          </div>
          <div className="p-8 flex-1">
            {medicationService.getMedications().length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum medicamento cadastrado</p>
            ) : (
              <div className="space-y-4">
                {medicationService.getMedications().slice(0, 5).map(med => (
                  <div key={med.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-400 group-hover:text-blue-600 transition-all">
                        <span className="material-symbols-outlined text-[22px]">medication</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{med.nome}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.unidade}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black tracking-tighter ${med.quantidade <= med.limiteEstoque ? 'text-amber-600' : 'text-blue-600'}`}>{med.quantidade}</span>
                      <span className="text-[10px] text-slate-400 font-black ml-1 uppercase">{med.unidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Atividades Recentes</h3>
            <NavLink
              to="/registros"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-2 py-1"
              aria-label="Ver todos os registros"
              title="Ver todos os registros"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_outward</span>
            </NavLink>
          </div>
          <div className="p-8 flex-1">
            <div className="space-y-6">
              {records.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-all">
                      <span className="material-symbols-outlined text-[22px]">water_drop</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.periodo}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.data.split('-').reverse().slice(0, 2).join('/')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black tracking-tighter ${record.antesRefeicao > 140 ? 'text-amber-600' : 'text-orange-600'}`}>{record.antesRefeicao}</span>
                    <span className="text-[10px] text-slate-400 font-black ml-1 uppercase">mg/dL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user?.plano !== 'PRO' && (
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest">Espaço Publicitário - Google AdSense</p>
          <div className="mt-4 h-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Anúncio {getAdSenseBlock('dashboard-after-activities')?.format}</span>
          </div>
        </div>
      )}

      {reminderModalOpen && currentReminder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#111121] rounded-lg overflow-hidden animate-zoom-in border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">schedule</span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Lembrete de Glicemia</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Medição 2h após</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Registro Original:</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-black">{currentReminder.recordData.periodo}</span> - {currentReminder.recordData.antesRefeicao} mg/dL
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-3 block">Glicemia 2h Após (mg/dL)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={aposRefeicaoValue || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setAposRefeicaoValue(val);
                    if (val >= 400) {
                      alert('⚠️ ATENÇÃO: Glicemia muito alta!\n\n💉 Lave bem as mãos e refaça o teste\n🏥 Se confirmar, procure ajuda médica\n\n🚨 Emergência:\n• Ambulância: 192\n• Resgate: 193');
                    }
                  }}
                  className="w-full text-center text-5xl font-black bg-transparent border-none outline-none text-blue-600"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSkipReminder} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[12px] uppercase rounded-xl">Pular</button>
                <button onClick={handleSaveReminder} className="flex-1 py-4 bg-blue-600 text-white font-black text-[12px] uppercase rounded-xl">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .health-marquee-track {
          display: flex;
          width: max-content;
          min-width: 100%;
          animation: health-marquee 26s linear infinite;
          will-change: transform;
        }
        .health-marquee-row {
          display: inline-flex;
          align-items: center;
          gap: 1.25rem;
          padding-right: 1.25rem;
        }
        .health-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }
        .health-marquee-chip {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-radius: 999px;
          padding: 2px 8px;
        }
        .health-marquee-text {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }
        .dark .health-marquee-text {
          color: #cbd5e1;
        }
        .group:hover .health-marquee-track {
          animation-play-state: paused;
        }
        @keyframes health-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color?: string;
  trend?: string;
}

const Card = memo<CardProps>(({ title, value, unit, icon, color = "text-slate-900 dark:text-white", trend }) => (
  <div className="
    group relative
    rounded-3xl border border-slate-200 dark:border-slate-800/80 
    bg-white dark:bg-[#111121] 
    p-7 
    transition-all duration-300 ease-out
    hover:-translate-y-1
  ">
    {/* Borda animada no hover */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500 pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="
          w-12 h-12 
          bg-gradient-to-br from-slate-50 to-slate-100 
          dark:from-slate-900 dark:to-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-2xl 
          flex items-center justify-center 
          text-slate-400 
          group-hover:text-orange-600 
          group-hover:scale-110
          group-hover:rotate-3
          transition-all duration-300
        ">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{icon}</span>
        </div>
        {trend && (
          <span className="
            px-3 py-1.5 
            bg-emerald-50 dark:bg-emerald-900/10 
            text-emerald-600 dark:text-emerald-400
            border border-emerald-200 dark:border-emerald-800
            rounded-lg 
            text-[9px] font-black uppercase tracking-wider
          ">
            {trend}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.15em]">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-black tracking-tighter ${color}`}>
            {value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            {unit}
          </span>
        </div>
      </div>
    </div>
  </div>
), (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.trend === nextProps.trend
  );
});

Card.displayName = 'Card';

export default DashboardPage;
