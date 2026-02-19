
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
import { getAdSenseBlock } from '../data/adsense';
import { getPlanById, getFormattedPrice } from '../data/plans';
import { getBannersForPage } from '../data/banners';

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
    { value: '90d' as const, label: '3 meses', days: 90 },
  ], []);

  const chartData = useMemo(() => {
    const days = periodOptions.find(p => p.value === period)?.days || 7;
    return [...records]
      .reverse()
      .slice(-days)
      .map(r => ({
        name: r.data.split('-')[2],
        val: r.antesRefeicao,
      }));
  }, [records, period, periodOptions]);

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
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between">
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
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl h-48 md:h-40">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-500 ${
                index === currentBannerIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className={`bg-gradient-to-br ${banner.gradient} rounded-2xl p-6 text-white h-full`}>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-2xl">{banner.icon}</span>
                    {banner.badge && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase mb-2">{banner.title}</h3>
                  <p className={`${banner.textColor} text-sm mb-4`}>{banner.description}</p>
                  <button
                    onClick={() => window.location.hash = banner.buttonLink}
                    className="px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase rounded-lg hover:bg-slate-50 transition-all"
                  >
                    {banner.buttonText}
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Propaganda</p>
            <div className="w-full h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-slate-400 text-xs">Anúncio 300x100</span>
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
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Tendência da Glicemia</h3>

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
        <div className="p-6 h-[340px] md:h-[360px]">
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
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}
                labelStyle={{
                  fontSize: '10px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  fontWeight: '800',
                  letterSpacing: '0.1em'
                }}
                formatter={(value: number) => {
                  const status = value > 180 ? '⚠️ Muito Alta' : value > 140 ? '⚡ Alta' : value < 70 ? '❄️ Baixa' : '✅ Normal';
                  return [`${value} mg/dL`, status];
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
