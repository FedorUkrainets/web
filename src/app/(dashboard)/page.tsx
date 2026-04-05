import { BatteryCharging, PlugZap, TrendingUp, Users } from 'lucide-react';
import { LoadAreaChart, RevenueBarChart, WeeklyLineChart } from '@/components/dashboard/DashboardCharts';
import { StatCard } from '@/components/dashboard/StatCard';

const loadData = [
  { label: '00:00', loadKw: 42 },
  { label: '04:00', loadKw: 58 },
  { label: '08:00', loadKw: 124 },
  { label: '12:00', loadKw: 176 },
  { label: '16:00', loadKw: 148 },
  { label: '20:00', loadKw: 116 },
  { label: '23:00', loadKw: 74 },
];

const revenueData = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 14100 },
  { month: 'Mar', revenue: 16500 },
  { month: 'Apr', revenue: 17200 },
  { month: 'May', revenue: 18800 },
  { month: 'Jun', revenue: 20500 },
];

const weeklyData = [
  { day: 'Mon', sessions: 196, energyKwh: 4180 },
  { day: 'Tue', sessions: 214, energyKwh: 4530 },
  { day: 'Wed', sessions: 233, energyKwh: 4920 },
  { day: 'Thu', sessions: 251, energyKwh: 5270 },
  { day: 'Fri', sessions: 274, energyKwh: 5610 },
  { day: 'Sat', sessions: 229, energyKwh: 4810 },
  { day: 'Sun', sessions: 207, energyKwh: 4370 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active sessions"
          value="128"
          subtitle="+9% vs yesterday"
          icon={BatteryCharging}
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total stations"
          value="42"
          subtitle="3 maintenance alerts"
          icon={PlugZap}
          iconClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Daily revenue"
          value="$3,840"
          subtitle="Current day"
          icon={TrendingUp}
          iconClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Connected drivers"
          value="1,542"
          subtitle="+34 new this week"
          icon={Users}
          iconClass="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Station load (today)</h2>
          <LoadAreaChart data={loadData} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Revenue trend</h2>
          <RevenueBarChart data={revenueData} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Sessions vs energy (last 7 days)</h2>
        <WeeklyLineChart data={weeklyData} />
      </section>
    </div>
  );
}
