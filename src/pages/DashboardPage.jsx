import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';

const statusLabel = {
  CREATED: 'Создана',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

export default function DashboardPage({ navigate, currentPath }) {
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
    const totalChargers = stations.reduce((sum, s) => sum + Number(s.total_chargers || 0), 0);
    const totalRevenue = stations.reduce((sum, s) => sum + Number(s.revenue || 0), 0);
    return { totalStations, activeStations, totalChargers, totalRevenue };
  }, [stations]);

  return (
    <div className="layout">
      <Sidebar navigate={navigate} currentPath={currentPath} />
      <main className="main-content">
        <h1>Панель управления</h1>
        <p className="muted">Краткая сводка по вашей сети зарядных станций.</p>

        {error && <p className="error">{error}</p>}

        <section className="cards metrics-cards">
          <article className="card">
            <h3>Всего станций</h3>
            <p className="metric-value">{metrics.totalStations}</p>
          </article>
          <article className="card">
            <h3>Активных станций</h3>
            <p className="metric-value">{metrics.activeStations}</p>
          </article>
          <article className="card">
            <h3>Всего зарядок</h3>
            <p className="metric-value">{metrics.totalChargers}</p>
          </article>
          <article className="card">
            <h3>Общая выручка</h3>
            <p className="metric-value">${metrics.totalRevenue.toFixed(2)}</p>
          </article>
        </section>

        <section className="card">
          <div className="row-between">
            <h2>Последние станции</h2>
            <button type="button" onClick={() => navigate('/stations')}>Открыть список станций</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Код</th>
                  <th>Статус</th>
                  <th>Нагрузка</th>
                  <th>Зарядки</th>
                </tr>
              </thead>
              <tbody>
                {stations.slice(0, 8).map((station) => (
                  <tr key={station.id}>
                    <td>{station.name}</td>
                    <td>{station.code}</td>
                    <td>{statusLabel[station.status] || station.status}</td>
                    <td>{station.current_load_kw}/{station.capacity_kw} kW</td>
                    <td>{station.active_chargers}/{station.total_chargers}</td>
                  </tr>
                ))}
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan="5">Станции пока не добавлены.</td>
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
