const db = require('../db/database');

const ALLOWED_TRANSITIONS = {
  CREATED: ['ACTIVE'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function mapStation(station) {
  const chargers = db.prepare('SELECT * FROM chargers WHERE station_id = ? ORDER BY id').all(station.id);
  return { ...station, chargers };
}

function validateTransition(current, next) {
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    const error = new Error(`Invalid status transition from ${current} to ${next}`);
    error.status = 409;
    throw error;
  }
}

function listStations() {
  const stations = db.prepare('SELECT * FROM stations ORDER BY id DESC').all();
  return stations.map(mapStation);
}

function createStation(payload) {
  const required = ['name', 'code', 'location', 'capacity_kw', 'current_load_kw', 'total_chargers', 'active_chargers'];
  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      const error = new Error(`Missing field: ${field}`);
      error.status = 400;
      throw error;
    }
  }

  if (payload.active_chargers > payload.total_chargers) {
    const error = new Error('active_chargers cannot exceed total_chargers');
    error.status = 400;
    throw error;
  }

  const tx = db.transaction((data) => {
    const stationResult = db.prepare(`
      INSERT INTO stations
      (name, code, location, status, capacity_kw, current_load_kw, total_chargers, active_chargers, revenue, last_maintenance_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.code,
      data.location,
      data.status || 'CREATED',
      data.capacity_kw,
      data.current_load_kw,
      data.total_chargers,
      data.active_chargers,
      data.revenue || 0,
      data.last_maintenance_at,
    );

    const stationId = stationResult.lastInsertRowid;
    const chargerPower = Number((data.capacity_kw / data.total_chargers).toFixed(2));

    for (let i = 1; i <= data.total_chargers; i += 1) {
      db.prepare('INSERT INTO chargers (station_id, label, power_kw, status) VALUES (?, ?, ?, ?)').run(
        stationId,
        `CH-${String(i).padStart(2, '0')}`,
        chargerPower,
        i <= data.active_chargers ? 'IN_USE' : 'AVAILABLE',
      );
    }

    if (data.force_fail) {
      throw new Error('Forced transaction failure');
    }

    return stationId;
  });

  let stationId;
  try {
    stationId = tx(payload);
  } catch (error) {
    if (!error.status) error.status = 400;
    throw error;
  }

  const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(stationId);
  return mapStation(station);
}

function deleteStation(id) {
  const existing = db.prepare('SELECT id FROM stations WHERE id = ?').get(id);
  if (!existing) {
    const error = new Error('Station not found');
    error.status = 404;
    throw error;
  }
  db.prepare('DELETE FROM stations WHERE id = ?').run(id);
  return { message: 'Station deleted' };
}

function changeStationStatus(id, status) {
  const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
  if (!station) {
    const error = new Error('Station not found');
    error.status = 404;
    throw error;
  }

  validateTransition(station.status, status);
  db.prepare('UPDATE stations SET status = ? WHERE id = ?').run(status, id);

  const updated = db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
  return mapStation(updated);
}

module.exports = { listStations, createStation, deleteStation, changeStationStatus };
