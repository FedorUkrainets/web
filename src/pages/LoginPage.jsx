import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ navigate }) {
  const [email, setEmail] = useState('admin@demo.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Вход</h1>
        <label htmlFor="email">Электронная почта</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Пароль</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="error">{error}</p>}

        <button type="submit">Войти</button>
        <p>
          Нет аккаунта?{' '}
          <button type="button" className="link-btn" onClick={() => navigate('/register')}>
            Зарегистрироваться
          </button>
        </p>
      </form>
    </main>
  );
}
