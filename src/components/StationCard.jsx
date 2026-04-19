import React from 'react';

const statusLabel = {
  CREATED: 'Создана',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};
const chargerStatusLabel = {
  AVAILABLE: 'Доступна',
  BUSY: 'Занята',
  OFFLINE: 'Отключена',
};

export default function StationCard({ station, pendingStatus, setPendingStatus, onChangeStatus, onDelete }) {
  return (
    <article className="card">
      <div className="row-between">
        <h3>{station.name}</h3>
        <span className={`status ${station.status.toLowerCase()}`}>{statusLabel[station.status] || station.status}</span>
      </div>
      <p>{station.code}</p>
      <p>{station.location}</p>
      <div className="metrics">
        <span>Нагрузка: {station.current_load_kw} / {station.capacity_kw} kW</span>
        <span>Зарядки: {station.active_chargers}/{station.total_chargers}</span>
        <span>Выручка: ${station.revenue}</span>
      </div>
      <div className="chargers">
        {station.chargers.map((charger) => (
          <span key={charger.id} className="chip">{charger.label} ({chargerStatusLabel[charger.status] || charger.status})</span>
        ))}
      </div>
      <div className="row">
        <select
          value={pendingStatus[station.id] || station.status}
          onChange={(e) => setPendingStatus((prev) => ({ ...prev, [station.id]: e.target.value }))}
        >
          <option value="CREATED">CREATED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button type="button" className="secondary" onClick={() => onChangeStatus(station)}>Обновить статус</button>
        <button type="button" className="danger" onClick={() => onDelete(station.id)}>Удалить</button>
      </div>
    </article>
  );
}
