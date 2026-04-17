import React, { useState } from 'react';
import { apiRequest } from '../services/api';

export default function RegisterPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: 'admin' }),
        token: null,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Регистрация</h1>
        <label htmlFor="reg-email">Электронная почта</label>
        <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="reg-password">Пароль</label>
        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

        {error && <p className="error">{error}</p>}

        <button type="submit">Создать аккаунт</button>
        <p>
          Уже зарегистрированы?{' '}
          <button type="button" className="link-btn" onClick={() => navigate('/login')}>
            Войти
          </button>
        </p>
      </form>
    </main>
  );
}
