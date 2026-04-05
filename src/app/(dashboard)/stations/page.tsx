'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Activity, Wrench, WifiOff } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type ChargerStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
type StationStatus = 'CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

type Connector = {
  id: string;
  label: string;
  type: string;
  powerKw: number;
  status: ChargerStatus;
};

type Station = {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string | null;
  status: StationStatus;
  capacityKw: number;
  currentLoadKw: number;
  totalChargers: number;
  activeChargers: number;
  revenue: number;
  lastMaintenanceAt: string | null;
  notes: string | null;
  connectors: Connector[];
};

type FilterTab = 'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | StationStatus;

type CreateStationForm = {
  name: string;
  code: string;
  address: string;
  city: string;
  status: StationStatus;
  capacityKw: string;
  currentLoadKw: string;
  totalChargers: string;
  activeChargers: string;
  revenue: string;
  lastMaintenanceAt: string;
  notes: string;
  forceFail: boolean;
};

const statusBadge: Record<StationStatus, string> = {
  CREATED: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'MAINTENANCE', label: 'Maintenance' },
  { key: 'OFFLINE', label: 'Offline' },
  { key: 'CREATED', label: 'Created' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const lifecycleTargets: StationStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<string, StationStatus>>({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CreateStationForm>({
    name: '',
    code: '',
    address: '',
    city: '',
    status: 'CREATED',
    capacityKw: '160',
    currentLoadKw: '0',
    totalChargers: '4',
    activeChargers: '0',
    revenue: '0',
    lastMaintenanceAt: '',
    notes: '',
    forceFail: false,
  });

  async function loadStations() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Station[]>('/stations');
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStations();
  }, []);

  const summary = useMemo(() => {
    const active = stations.filter((s) => s.status === 'ACTIVE').length;
    const maintenance = stations.filter((s) => s.connectors.some((c) => c.status === 'MAINTENANCE')).length;
    const totalChargers = stations.reduce((acc, s) => acc + s.totalChargers, 0);
    const offline = stations.filter((s) => s.status === 'ACTIVE' && s.activeChargers === 0).length;
    return { active, maintenance, totalChargers, offline };
  }, [stations]);

  const filteredStations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return stations.filter((station) => {
      const matchesQuery = !normalized
        || station.name.toLowerCase().includes(normalized)
        || station.address.toLowerCase().includes(normalized)
        || station.code.toLowerCase().includes(normalized);

      const inMaintenance = station.connectors.some((c) => c.status === 'MAINTENANCE');
      const isOffline = station.status === 'ACTIVE' && station.activeChargers === 0;

      const matchesFilter = filter === 'ALL'
        || (filter === 'MAINTENANCE' && inMaintenance)
        || (filter === 'OFFLINE' && isOffline)
        || station.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [stations, query, filter]);

  async function onCreateStation(e: FormEvent) {
    e.preventDefault();
    setActionError(null);

    const capacity = Number(form.capacityKw);
    const current = Number(form.currentLoadKw);
    const total = Number(form.totalChargers);
    const active = Number(form.activeChargers);
    const revenue = Number(form.revenue);

    if (active > total) {
      setActionError('Active chargers cannot exceed total chargers');
      return;
    }
    if (current > capacity) {
      setActionError('Current load cannot exceed capacity');
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch('/stations', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          code: form.code || undefined,
          address: form.address,
          city: form.city || undefined,
          status: form.status,
          capacityKw: capacity,
          currentLoadKw: current,
          totalChargers: total,
          activeChargers: active,
          revenue,
          lastMaintenanceAt: form.lastMaintenanceAt ? new Date(form.lastMaintenanceAt).toISOString() : undefined,
          notes: form.notes || undefined,
          forceFail: form.forceFail || undefined,
        }),
      });
      setShowCreate(false);
      setForm({
        name: '',
        code: '',
        address: '',
        city: '',
        status: 'CREATED',
        capacityKw: '160',
        currentLoadKw: '0',
        totalChargers: '4',
        activeChargers: '0',
        revenue: '0',
        lastMaintenanceAt: '',
        notes: '',
        forceFail: false,
      });
      await loadStations();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create station');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDeleteStation(station: Station) {
    setActionError(null);
    const confirmed = window.confirm(`Delete ${station.name}? This also removes all related chargers.`);
    if (!confirmed) return;
    try {
      await apiFetch(`/stations/${station.id}`, { method: 'DELETE' });
      await loadStations();
      if (selected?.id === station.id) {
        setSelected(null);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete station');
    }
  }

  async function onChangeStatus(station: Station) {
    const next = pendingStatus[station.id];
    if (!next || next === station.status) return;
    setActionError(null);
    try {
      await apiFetch(`/stations/${station.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      await loadStations();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update station status');
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Charging Stations</h1>
          <p className="text-sm text-slate-600">Manage and monitor all EV charging stations.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          onClick={() => setShowCreate(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Station
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active Stations</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Maintenance Needed</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{summary.maintenance}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Chargers</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{summary.totalChargers}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Offline Stations</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{summary.offline}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by station name, code, or address"
              value={query}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  filter === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {actionError ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>
      ) : null}
      {error ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading stations…</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {filteredStations.map((station) => {
          const loadPercent = station.capacityKw > 0 ? Math.min(100, Math.round((station.currentLoadKw / station.capacityKw) * 100)) : 0;
          return (
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={station.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{station.name}</h3>
                  <p className="text-xs text-slate-500">{station.code}</p>
                  <p className="mt-1 text-sm text-slate-600">{station.address}{station.city ? `, ${station.city}` : ''}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[station.status]}`}>{station.status}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Current Load</p>
                  <p className="font-semibold text-slate-800">{station.currentLoadKw} / {station.capacityKw} kW</p>
                </div>
                <div>
                  <p className="text-slate-500">Chargers</p>
                  <p className="font-semibold text-slate-800">{station.activeChargers}/{station.totalChargers}</p>
                </div>
                <div>
                  <p className="text-slate-500">Revenue</p>
                  <p className="font-semibold text-slate-800">{currency(station.revenue)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last maintenance</p>
                  <p className="font-semibold text-slate-800">{formatDate(station.lastMaintenanceAt)}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Load usage</span>
                  <span>{loadPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${loadPercent}%` }} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setSelected(station)}
                  type="button"
                >
                  View Details
                </button>
                <select
                  className="rounded border border-slate-300 px-2 py-1.5 text-xs"
                  onChange={(e) => setPendingStatus((prev) => ({ ...prev, [station.id]: e.target.value as StationStatus }))}
                  value={pendingStatus[station.id] ?? station.status}
                >
                  {lifecycleTargets.map((target) => (
                    <option key={target} value={target}>{target}</option>
                  ))}
                </select>
                <button
                  className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  onClick={() => onChangeStatus(station)}
                  type="button"
                >
                  Change Status
                </button>
                <button
                  className="ml-auto inline-flex items-center gap-1 rounded border border-rose-200 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                  onClick={() => onDeleteStation(station)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500">{selected.code} • {selected.address}</p>
              </div>
              <button className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setSelected(null)} type="button">Close</button>
            </div>

            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" /> {selected.currentLoadKw} kW load</div>
              <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-amber-600" /> {selected.connectors.filter((c) => c.status === 'MAINTENANCE').length} in maintenance</div>
              <div className="flex items-center gap-2"><WifiOff className="h-4 w-4 text-rose-600" /> {selected.activeChargers === 0 ? 'Offline' : 'Online'}</div>
            </div>

            <h3 className="mt-5 text-sm font-semibold text-slate-800">Related chargers ({selected.connectors.length})</h3>
            <div className="mt-2 space-y-2">
              {selected.connectors.map((connector) => (
                <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm" key={connector.id}>
                  <div>
                    <p className="font-medium text-slate-800">{connector.label}</p>
                    <p className="text-xs text-slate-500">{connector.type} • {connector.powerKw} kW</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{connector.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <form className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl" onSubmit={onCreateStation}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add Station</h2>
              <button className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setShowCreate(false)} type="button">
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Station name *" required value={form.name} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="Station code (optional)" value={form.code} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address *" required value={form.address} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" value={form.city} />
              <select className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StationStatus }))} value={form.status}>
                <option value="CREATED">CREATED</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" min={0} onChange={(e) => setForm((p) => ({ ...p, capacityKw: e.target.value }))} placeholder="Capacity kW *" required type="number" value={form.capacityKw} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" min={0} onChange={(e) => setForm((p) => ({ ...p, currentLoadKw: e.target.value }))} placeholder="Current load kW *" required type="number" value={form.currentLoadKw} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" min={1} onChange={(e) => setForm((p) => ({ ...p, totalChargers: e.target.value }))} placeholder="Total chargers *" required type="number" value={form.totalChargers} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" min={0} onChange={(e) => setForm((p) => ({ ...p, activeChargers: e.target.value }))} placeholder="Active chargers *" required type="number" value={form.activeChargers} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" min={0} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))} placeholder="Revenue (USD)" type="number" value={form.revenue} />
              <input className="rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, lastMaintenanceAt: e.target.value }))} type="date" value={form.lastMaintenanceAt} />
            </div>
            <textarea className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={3} value={form.notes} />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <input checked={form.forceFail} onChange={(e) => setForm((p) => ({ ...p, forceFail: e.target.checked }))} type="checkbox" />
              Force transaction failure (rollback demo)
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700" onClick={() => setShowCreate(false)} type="button">
                Cancel
              </button>
              <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-60" disabled={submitting} type="submit">
                {submitting ? 'Saving...' : 'Create Station'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
