import React, { useState } from 'react';

const initialForm = {
  name: '',
  code: '',
  location: '',
  capacity_kw: 120,
  current_load_kw: 0,
  total_chargers: 2,
  active_chargers: 0,
  revenue: 0,
  last_maintenance_at: '',
  force_fail: false,
};

export default function AddStationModal({ onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate({
      ...form,
      capacity_kw: Number(form.capacity_kw),
      current_load_kw: Number(form.current_load_kw),
      total_chargers: Number(form.total_chargers),
      active_chargers: Number(form.active_chargers),
      revenue: Number(form.revenue),
      last_maintenance_at: form.last_maintenance_at || null,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>Add Station</h3>
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input placeholder="Code" required value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
        <input placeholder="Location" required value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        <input type="number" min="1" placeholder="Capacity kW" value={form.capacity_kw} onChange={(e) => setForm((p) => ({ ...p, capacity_kw: e.target.value }))} />
        <input type="number" min="0" placeholder="Current load kW" value={form.current_load_kw} onChange={(e) => setForm((p) => ({ ...p, current_load_kw: e.target.value }))} />
        <input type="number" min="1" placeholder="Total chargers" value={form.total_chargers} onChange={(e) => setForm((p) => ({ ...p, total_chargers: e.target.value }))} />
        <input type="number" min="0" placeholder="Active chargers" value={form.active_chargers} onChange={(e) => setForm((p) => ({ ...p, active_chargers: e.target.value }))} />
        <input type="number" min="0" placeholder="Revenue" value={form.revenue} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))} />
        <label>
          Last maintenance
          <input type="date" value={form.last_maintenance_at} onChange={(e) => setForm((p) => ({ ...p, last_maintenance_at: e.target.value }))} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.force_fail} onChange={(e) => setForm((p) => ({ ...p, force_fail: e.target.checked }))} />
          Force transaction failure (rollback demo)
        </label>
        <div className="row">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}
