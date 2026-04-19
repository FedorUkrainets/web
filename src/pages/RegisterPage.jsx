import React, { useState } from 'react';
import { apiRequest } from '../services/api';

export default function RegisterPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      // role не передаём: выдать админа может только бэкенд.
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        token: null,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Регистрация</h1>
        <p className="muted">Создайте аккаунт для доступа к системе.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? '...' : 'Создать аккаунт'}</button>
        <p>Уже зарегистрированы? <button type="button" className="link-btn" onClick={() => navigate('/login')}>Войти</button></p>
      </form>
    </main>
  );
}
