export default function StationCard({ station, pendingStatus, setPendingStatus, onChangeStatus, onDelete }) {
  return (
    <article className="card">
      <div className="row-between">
        <h3>{station.name}</h3>
        <span className={`status ${station.status.toLowerCase()}`}>{station.status}</span>
      </div>
      <p>{station.code}</p>
      <p>{station.location}</p>
      <div className="metrics">
        <span>Load: {station.current_load_kw} / {station.capacity_kw} kW</span>
        <span>Chargers: {station.active_chargers}/{station.total_chargers}</span>
        <span>Revenue: ${station.revenue}</span>
      </div>
      <div className="chargers">
        {station.chargers.map((charger) => (
          <span key={charger.id} className="chip">{charger.label} ({charger.status})</span>
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
        <button type="button" className="secondary" onClick={() => onChangeStatus(station)}>Change Status</button>
        <button type="button" className="danger" onClick={() => onDelete(station.id)}>Delete</button>
      </div>
    </article>
  );
}
