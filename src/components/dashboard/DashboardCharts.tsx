'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type LoadPoint = { label: string; loadKw: number };
type RevPoint = { month: string; revenue: number };
type WeekPoint = { day: string; sessions: number; energyKwh: number };

export function LoadAreaChart({ data }: { data: LoadPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 200]} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
            formatter={(v: number) => [`${v} kW`, 'Load']}
          />
          <Area
            type="monotone"
            dataKey="loadKw"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#loadFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ data }: { data: RevPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }}
            formatter={(v: number) => [v.toLocaleString(), 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyLineChart({ data }: { data: WeekPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[160, 320]} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[3000, 6000]} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 4, fill: '#f97316' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="energyKwh"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
