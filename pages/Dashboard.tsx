
import React, { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockService } from '../services/mockService';
import { GlucoseRecord } from '../types';
import { useAuth } from '../App';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const s = await mockService.getDashboardStats();
    const r = await mockService.getRecords();
    setStats(s);
    setRecords(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const chartData = [...records].reverse().slice(-7).map(r => ({
    name: r.data.split('-')[2],
    val: r.antesRefeicao,
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up-subtle">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Olá, {user?.nome?.split(' ')[0] || 'Usuário'}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Seu controle glicêmico em tempo real.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card title="Glicemia Média" value={`${stats.average}`} unit="mg/dL" icon="insights" trend={stats.average > 140 ? 'Alta' : 'Estável'} />
        <Card title="No Alvo" value={`${Math.min(100, Math.max(0, 100 - (stats.average > 140 ? (stats.average-140)/2 : 0)))}%`} unit="ideal" icon="check_circle" color="text-emerald-500" />
        <Card title="Última" value={`${stats.lastGlicemy}`} unit="mg/dL" icon="timer" />
        <Card title="Alertas" value={`${stats.alerts?.length || 0}`} unit="ativos" icon="notifications" color="text-orange-500" />
      </div>

      <div className="grid gap-8 md:grid-cols-12 pb-24 md:pb-0">
        <div className="md:col-span-8 rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tendência Semanal</h3>
          </div>
          <div className="p-6 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px'}} 
                  itemStyle={{fontSize: '14px', fontWeight: '900', color: '#f97316'}}
                  labelStyle={{fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="val" stroke="#f97316" strokeWidth={5} fillOpacity={1} fill="url(#orangeGrad)" dot={{fill: '#f97316', r: 6, strokeWidth: 3, stroke: '#fff'}} activeDot={{ r: 10, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-4 rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Atividades Recentes</h3>
          </div>
          <div className="p-8 flex-1">
            <div className="space-y-6">
              {records.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-all shadow-sm">
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

const Card: React.FC<CardProps> = ({ title, value, unit, icon, color = "text-slate-900 dark:text-white", trend }) => (
  <div className="rounded-4xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111121] p-6 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-all">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      {trend && (
        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-[10px] text-slate-400 font-black uppercase">{unit}</span>
      </div>
    </div>
  </div>
);

export default DashboardPage;
