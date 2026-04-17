import React from 'react';

const STATUS_LABELS = {
  CREATED: 'Создана',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

export default function StationCard({ station, pendingStatus, setPendingStatus, onChangeStatus, onDelete }) {
  return (
    <article className="card station-card">
      <div className="row-between">
        <h3>{station.name}</h3>
        <span className={`status ${station.status.toLowerCase()}`}>{STATUS_LABELS[station.status] || station.status}</span>
      </div>

      <p className="meta-line">Код: {station.code}</p>
      <p className="meta-line">Локация: {station.location}</p>

      <div className="metrics">
        <span>Нагрузка: {station.current_load_kw} / {station.capacity_kw} кВт</span>
        <span>Зарядки: {station.active_chargers}/{station.total_chargers}</span>
        <span>Выручка: ${station.revenue}</span>
      </div>

      <div className="chargers">
        {station.chargers.map((charger) => (
          <span key={charger.id} className="chip">{charger.label} ({charger.status})</span>
        ))}
      </div>

      <div className="row station-actions">
        <select
          value={pendingStatus[station.id] || station.status}
          onChange={(e) => setPendingStatus((prev) => ({ ...prev, [station.id]: e.target.value }))}
        >
          <option value="CREATED">Создана</option>
          <option value="ACTIVE">Активна</option>
          <option value="COMPLETED">Завершена</option>
          <option value="CANCELLED">Отменена</option>
        </select>
        <button type="button" className="secondary" onClick={() => onChangeStatus(station)}>Сменить статус</button>
        <button type="button" className="danger" onClick={() => onDelete(station.id)}>Удалить</button>
      </div>
    </article>
  );
}
