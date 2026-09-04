'use client';

import { FormEvent, useState } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Не удалось войти');
        return;
      }

      window.location.reload();
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="login-card">
        <p className="eyebrow">TEST ADMIN</p>
        <h1>Вход в админку</h1>
        <p className="muted">
          Логин и пароль берутся из Vercel Environment Variables и не хранятся в публичном GitHub repository.
        </p>
        <form onSubmit={handleLogin} className="login-form">
          <label>
            Логин
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Входим…' : 'Войти'}</button>
        </form>
        <a className="back-link" href="/">← На сайт</a>
      </section>
    </main>
  );
}
