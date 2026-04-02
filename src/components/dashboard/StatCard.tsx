import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconClass?: string;
};

export function StatCard({ title, value, subtitle, icon: Icon, iconClass }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            iconClass ?? 'bg-blue-50 text-blue-600',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
