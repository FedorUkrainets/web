import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';

export default function DashboardPage({ navigate }) {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const data = await apiRequest('/stations');
        setStations(data);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  const metrics = useMemo(() => {
    const totalStations = stations.length;
    const activeStations = stations.filter((s) => s.status === 'ACTIVE').length;
    const totalChargers = stations.reduce((sum, s) => sum + s.total_chargers, 0);
    const totalRevenue = stations.reduce((sum, s) => sum + Number(s.revenue || 0), 0);
    return { totalStations, activeStations, totalChargers, totalRevenue };
  }, [stations]);

  return (
    <div className="layout">
      <Sidebar navigate={navigate} />
      <main className="main-content">
        <h1>Dashboard</h1>
        <p className="muted">Quick overview of your EV network.</p>

        {error && <p className="error">{error}</p>}

        <section className="cards metrics-cards">
          <article className="card">
            <h3>Total stations</h3>
            <p className="metric-value">{metrics.totalStations}</p>
          </article>
          <article className="card">
            <h3>Active stations</h3>
            <p className="metric-value">{metrics.activeStations}</p>
          </article>
          <article className="card">
            <h3>Total chargers</h3>
            <p className="metric-value">{metrics.totalChargers}</p>
          </article>
          <article className="card">
            <h3>Total revenue</h3>
            <p className="metric-value">${metrics.totalRevenue.toFixed(2)}</p>
          </article>
        </section>

        <section className="card">
          <div className="row-between">
            <h2>Recent stations</h2>
            <button type="button" onClick={() => navigate('/stations')}>Open stations</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Load</th>
                  <th>Chargers</th>
                </tr>
              </thead>
              <tbody>
                {stations.slice(0, 8).map((station) => (
                  <tr key={station.id}>
                    <td>{station.name}</td>
                    <td>{station.code}</td>
                    <td>{station.status}</td>
                    <td>{station.current_load_kw}/{station.capacity_kw} kW</td>
                    <td>{station.active_chargers}/{station.total_chargers}</td>
                  </tr>
                ))}
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan="5">No stations yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
