import { useState } from 'react';
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
      navigate('/stations');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
        <p>Need an account? <button type="button" className="link-btn" onClick={() => navigate('/register')}>Register</button></p>
      </form>
    </main>
  );
}
