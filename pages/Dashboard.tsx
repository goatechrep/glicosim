
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { mockService } from '../services/mockService';
import { GlucoseRecord, Alert } from '../types';

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

  if (loading) return <div className="text-center py-20 font-bold uppercase tracking-widest opacity-50">Carregando Dashboard...</div>;

  const chartData = [...records].reverse().slice(-10).map(r => ({
    name: r.data.split('-').reverse().join('/'),
    val: r.antesRefeicao
  }));

  const pieData = [
    { name: 'No Alvo', value: records.filter(r => r.antesRefeicao >= 70 && r.antesRefeicao <= 100).length },
    { name: 'Alto', value: records.filter(r => r.antesRefeicao > 100).length },
    { name: 'Baixo', value: records.filter(r => r.antesRefeicao < 70).length },
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Visão Geral</h2>
          <p className="text-gray-500 text-sm">Acompanhe seu desempenho glicêmico em tempo real.</p>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 border border-gray-200 dark:border-gray-700">
          {/* Fix: hour and minute should be '2-digit' or 'numeric', not '2d' */}
          Atualizado hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Última Glicemia" value={stats.lastGlicemy} unit="mg/dL" trend="neutral" subtitle="Último registro" />
        <KPICard title="Média Semanal" value={stats.average} unit="mg/dL" trend={stats.average < 100 ? 'good' : 'warning'} subtitle="Média total" />
        <KPICard title="Status Meta" value={stats.goalStatus} unit="" trend={stats.goalStatus === 'No Alvo' ? 'good' : 'warning'} subtitle="Meta 55-100 mg/dL" />
        <KPICard title="Total Registros" value={stats.totalRecords} unit="" trend="neutral" subtitle="Desde o início" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Tendência Semanal</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-blue-500"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Glicemia (mg/dL)</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #374151', borderRadius: '0px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Distribuição</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-gray-400 font-bold uppercase">{item.name}</span>
                </div>
                <span className="font-black italic">{item.value} registros</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Últimos Alertas</h3>
          <div className="space-y-3">
            {stats.alerts.slice(0, 3).map((alert: Alert) => (
              <div key={alert.id} className="p-3 bg-gray-50 dark:bg-gray-900 border-l-4 border-blue-500 flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm uppercase italic">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{alert.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Recentes</h3>
          <div className="space-y-4">
            {records.slice(0, 5).map((rec: GlucoseRecord) => (
              <div key={rec.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-tighter italic">{rec.periodo}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">{rec.data}</p>
                </div>
                <div className="text-xl font-black italic text-blue-500">
                  {rec.antesRefeicao} <span className="text-[10px] font-normal not-italic text-gray-400">mg/dL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string | number; unit: string; trend: 'good' | 'warning' | 'neutral'; subtitle: string }> = ({ title, value, unit, trend, subtitle }) => {
  const trendColor = trend === 'good' ? 'text-green-500' : trend === 'warning' ? 'text-red-500' : 'text-blue-500';
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between transition-transform hover:scale-[1.02]">
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-black italic tracking-tighter ${trendColor}`}>{value}</span>
          <span className="text-xs font-bold text-gray-500">{unit}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-4 tracking-wider">{subtitle}</p>
    </div>
  );
};

export default DashboardPage;
