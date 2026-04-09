import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import StationCard from '../components/StationCard';
import AddStationModal from '../components/AddStationModal';
import { apiRequest } from '../services/api';

export default function StationsPage({ navigate }) {
  const [stations, setStations] = useState([]);
  const [pendingStatus, setPendingStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  async function loadStations() {
    try {
      setError('');
      const data = await apiRequest('/stations');
      setStations(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadStations(); }, []);

  async function createStation(payload) {
    try {
      await apiRequest('/stations', { method: 'POST', body: JSON.stringify(payload) });
      await loadStations();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteStation(id) {
    await apiRequest(`/stations/${id}`, { method: 'DELETE' });
    await loadStations();
  }

  async function changeStatus(station) {
    const next = pendingStatus[station.id] || station.status;
    try {
      await apiRequest(`/stations/${station.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      await loadStations();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="layout">
      <Sidebar navigate={navigate} />
      <main className="main-content">
        <div className="row-between">
          <h1>Stations</h1>
          <button type="button" onClick={() => setShowModal(true)}>Add Station</button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="cards">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              pendingStatus={pendingStatus}
              setPendingStatus={setPendingStatus}
              onChangeStatus={changeStatus}
              onDelete={deleteStation}
            />
          ))}
        </div>
      </main>
      {showModal && <AddStationModal onClose={() => setShowModal(false)} onCreate={createStation} />}
    </div>
  );
}
