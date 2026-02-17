
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockService } from '../services/mockService';
import { GlucoseRecord } from '../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const s = await mockService.getDashboardStats();
      const r = await mockService.getRecords();
      setStats(s);
      setRecords(r);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const chartData = [...records].reverse().slice(-7).map(r => ({
    name: r.data.split('-')[2],
    val: r.antesRefeicao,
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Visão geral do seu controle glicêmico.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card title="Glicemia Média" value={`${stats.average}`} unit="mg/dL" icon="insights" trend="+2%" />
        <Card title="No Alvo" value="85%" unit="ideal" icon="check_circle" color="text-emerald-500" />
        <Card title="Última" value={`${stats.lastGlicemy}`} unit="mg/dL" icon="timer" />
        <Card title="Alertas" value={`${stats.alerts?.length || 0}`} unit="ativos" icon="notifications" color="text-orange-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Charts Section */}
        <div className="md:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider">Tendência Semanal</h3>
          </div>
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="val" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#orangeGrad)" dot={{fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff'}} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="md:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider">Últimas Medições</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {records.slice(0, 4).map(record => (
                <div key={record.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{record.periodo}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{record.data.split('-').reverse().slice(0,2).join('/')}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${record.antesRefeicao > 140 ? 'text-amber-600' : 'text-orange-600'}`}>{record.antesRefeicao}</span>
                    <span className="text-[9px] text-slate-400 font-bold ml-1">mg/dL</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2 text-[10px] font-bold text-slate-400 hover:text-orange-600 uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all">
              Histórico Completo
            </button>
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
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mr-1">{title}</span>
      <span className="material-symbols-outlined text-slate-300 text-[18px]">{icon}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-bold tracking-tight ${color}`}>{value}</span>
      <span className="text-[9px] text-slate-400 font-bold uppercase">{unit}</span>
    </div>
    {trend && <span className="text-[9px] font-bold text-emerald-500 mt-1 block">{trend} vs mês ant.</span>}
  </div>
);

export default DashboardPage;
