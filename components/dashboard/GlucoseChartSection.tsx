import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartPoint {
  dateISO: string;
  name: string;
  val: number;
  sum: number;
  min: number;
  max: number;
  count: number;
  periodAvg: number;
  deltaPeriod: number;
}

interface ChartInsights {
  avg: number;
  max: number;
  min: number;
  days: number;
}

interface PeriodOption {
  value: '7d' | '30d' | '90d';
  label: string;
}

interface GlucoseChartSectionProps {
  chartData: ChartPoint[];
  chartInsights: ChartInsights | null;
  chartRangeLabel: string;
  period: '7d' | '30d' | '90d';
  periodOptions: PeriodOption[];
  onChangePeriod: (period: '7d' | '30d' | '90d') => void;
}

const getGlycemiaStatus = (value: number) => {
  if (value > 180) return { label: 'Muito Alta', color: 'text-red-600 dark:text-red-400' };
  if (value > 140) return { label: 'Alta', color: 'text-amber-600 dark:text-amber-400' };
  if (value < 70) return { label: 'Baixa', color: 'text-blue-600 dark:text-blue-400' };
  return { label: 'Normal', color: 'text-emerald-600 dark:text-emerald-400' };
};

const GlucoseChartSection: React.FC<GlucoseChartSectionProps> = ({
  chartData,
  chartInsights,
  chartRangeLabel,
  period,
  periodOptions,
  onChangePeriod,
}) => {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white overflow-hidden flex flex-col dark:border-slate-800/80 dark:bg-[#111121]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 flex-wrap md:gap-4 sm:p-6 md:p-8 dark:border-slate-800/80">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Tendência da Glicemia</h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {chartRangeLabel}
          </p>
        </div>

        <div className="flex w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800/50">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChangePeriod(option.value)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 sm:flex-none ${
                period === option.value
                  ? 'bg-white text-orange-600 dark:bg-slate-700'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-label={`Mostrar dados de ${option.label}`}
              aria-pressed={period === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 300]} />
              <Tooltip
                cursor={{ stroke: '#f97316', strokeOpacity: 0.25, strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
                  padding: '8px 10px',
                  minWidth: '180px',
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as ChartPoint;
                  const status = getGlycemiaStatus(point.val);

                  return (
                    <div className="min-w-[180px] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{point.name}</p>
                      <div className="mt-1.5 flex items-baseline justify-between gap-2">
                        <p className="text-base font-black text-orange-600">
                          {point.val} <span className="text-[10px] text-slate-500">mg/dL</span>
                        </p>
                        <p className={`text-[10px] font-black ${status.color}`}>{status.label}</p>
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <p className="text-slate-600">Mín: <span className="font-black text-slate-900">{point.min}</span></p>
                        <p className="text-slate-600">Máx: <span className="font-black text-slate-900">{point.max}</span></p>
                        <p className="text-slate-600">Medições: <span className="font-black text-slate-900">{point.count}</span></p>
                        <p className="text-slate-600">
                          Vs média período:{' '}
                          <span className={`font-black ${point.deltaPeriod > 0 ? 'text-red-600' : point.deltaPeriod < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {point.deltaPeriod > 0 ? `+${point.deltaPeriod}` : point.deltaPeriod} mg/dL
                          </span>
                        </p>
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
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Média Ponderada</p>
              <p className="text-sm font-black text-orange-600">{chartInsights.avg} mg/dL</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Maior Média Dia</p>
              <p className="text-sm font-black text-red-600">{chartInsights.max} mg/dL</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Menor Média Dia</p>
              <p className="text-sm font-black text-emerald-600">{chartInsights.min} mg/dL</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dias no Gráfico</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">{chartInsights.days}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlucoseChartSection;
