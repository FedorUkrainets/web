const { pool, query } = require('../db/database');

const ALLOWED_TRANSITIONS = {
  CREATED: ['ACTIVE'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function validateTransition(current, next) {
  const transitions = ALLOWED_TRANSITIONS[current];
  if (!transitions || !transitions.includes(next)) {
    const error = new Error(`Invalid status transition from ${current} to ${next}`);
    error.status = 409;
    throw error;
  }
}

function mapStationsWithChargers(stations, chargers) {
  const chargersByStation = new Map();
  for (const charger of chargers) {
    const list = chargersByStation.get(charger.station_id) || [];
    list.push(charger);
    chargersByStation.set(charger.station_id, list);
  }
  return stations.map((station) => ({
    ...station,
    chargers: chargersByStation.get(station.id) || [],
  }));
}

async function listStations() {
  const stationResult = await query('SELECT * FROM stations ORDER BY id DESC');
  const stations = stationResult.rows;
  if (stations.length === 0) return [];

  const stationIds = stations.map((station) => station.id);
  const chargerResult = await query(
    'SELECT * FROM chargers WHERE station_id = ANY($1::int[]) ORDER BY id',
    [stationIds],
  );
  return mapStationsWithChargers(stations, chargerResult.rows);
}

async function createStation(payload) {
  const required = ['name', 'code', 'location', 'capacity_kw', 'current_load_kw', 'total_chargers', 'active_chargers'];
  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      const error = new Error(`Missing field: ${field}`);
      error.status = 400;
      throw error;
    }
  }

  const capacity = Number(payload.capacity_kw);
  const totalChargers = Number(payload.total_chargers);
  const activeChargers = Number(payload.active_chargers);

  if (!Number.isFinite(capacity) || capacity <= 0) {
    const error = new Error('capacity_kw must be a positive number');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(totalChargers) || totalChargers <= 0) {
    const error = new Error('total_chargers must be a positive integer');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(activeChargers) || activeChargers < 0 || activeChargers > totalChargers) {
    const error = new Error('active_chargers must be between 0 and total_chargers');
    error.status = 400;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const stationInsert = await client.query(
      `INSERT INTO stations
       (name, code, location, status, capacity_kw, current_load_kw, total_chargers, active_chargers, revenue, last_maintenance_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        payload.name,
        payload.code,
        payload.location,
        payload.status || 'CREATED',
        capacity,
        Number(payload.current_load_kw),
        totalChargers,
        activeChargers,
        Number(payload.revenue) || 0,
        payload.last_maintenance_at || null,
      ],
    );

    const stationId = stationInsert.rows[0].id;
    const chargerPower = Number((capacity / totalChargers).toFixed(2));

    for (let i = 1; i <= totalChargers; i += 1) {
      await client.query(
        'INSERT INTO chargers (station_id, label, power_kw, status) VALUES ($1, $2, $3, $4)',
        [
          stationId,
          `CH-${String(i).padStart(2, '0')}`,
          chargerPower,
          i <= activeChargers ? 'BUSY' : 'AVAILABLE',
        ],
      );
    }

    if (payload.force_fail) {
      throw new Error('Forced transaction failure');
    }

    await client.query('COMMIT');
    return await getStationById(stationId);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      error.status = 409;
      error.message = 'Station code already exists';
    }
    if (!error.status) error.status = 400;
    throw error;
  } finally {
    client.release();
  }
}

async function getStationById(id) {
  const stationResult = await query('SELECT * FROM stations WHERE id = $1', [id]);
  if (stationResult.rowCount === 0) return null;
  const chargerResult = await query('SELECT * FROM chargers WHERE station_id = $1 ORDER BY id', [id]);
  return { ...stationResult.rows[0], chargers: chargerResult.rows };
}

async function deleteStation(id) {
  const result = await query('DELETE FROM stations WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) {
    const error = new Error('Station not found');
    error.status = 404;
    throw error;
  }
  return { message: 'Station deleted' };
}

async function changeStationStatus(id, status) {
  if (!status) {
    const error = new Error('status is required');
    error.status = 400;
    throw error;
  }
  const station = await query('SELECT * FROM stations WHERE id = $1', [id]);
  if (station.rowCount === 0) {
    const error = new Error('Station not found');
    error.status = 404;
    throw error;
  }

  validateTransition(station.rows[0].status, status);
  await query('UPDATE stations SET status = $1 WHERE id = $2', [status, id]);
  return await getStationById(id);
}

module.exports = { listStations, createStation, deleteStation, changeStationStatus, getStationById };
