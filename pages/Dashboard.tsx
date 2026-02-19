
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockService } from '../services/mockService';
import { dataSyncService } from '../services/dataSyncService';
import { GlucoseRecord } from '../types';
import { useAuth } from '../App';
import { SkeletonCard, SkeletonChart } from '../components/SkeletonCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const loadData = useCallback(async () => {
    const s = await dataSyncService.getDashboardStats();
    const r = await dataSyncService.getRecords();
    setStats(s);
    setRecords(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

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
        <div className="animate-slide-up-subtle">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Olá, {user?.nome?.split(' ')[0] || 'Usuário'}!</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Seu controle glicêmico em tempo real.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-900/20">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card title="Glicemia Média" value={`${stats.average}`} unit="mg/dL" icon="insights" trend={stats.average > 140 ? 'Alta' : 'Estável'} />
        <Card title="No Alvo" value={`${Math.min(100, Math.max(0, 100 - (stats.average > 140 ? (stats.average-140)/2 : 0)))}%`} unit="ideal" icon="check_circle" color="text-emerald-500 dark:text-emerald-400" />
        <Card title="Última" value={`${stats.lastGlicemy}`} unit="mg/dL" icon="timer" />
        <Card title="Alertas" value={`${stats.alerts?.length || 0}`} unit="ativos" icon="notifications" color="text-orange-500 dark:text-orange-400" />
      </div>

      <div className="grid gap-8 md:grid-cols-12 pb-24 md:pb-0">
        <div className="md:col-span-8 rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Tendência de Glicemia</h3>
            
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
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" opacity={0.3} className="dark:opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} 
                  dy={12} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}}
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
                  itemStyle={{fontSize: '14px', fontWeight: '700', color: '#f97316'}}
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
                  dot={{fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff', fill: '#f97316' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-4 rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] flex flex-col">
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.data.split('-').reverse().slice(0,2).join('/')}</span>
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
