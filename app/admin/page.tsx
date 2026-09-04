'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DEFAULT_CONTENT, STORAGE_KEY, type SiteContent } from '../content';

const SESSION_KEY = 'candle-card-admin-auth';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    setLoggedIn(window.sessionStorage.getItem(SESSION_KEY) === 'yes');
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setContent(JSON.parse(saved));
    } catch {
      // Use defaults.
    }
  }, []);

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (login === 'admin' && password === 'admin') {
      window.sessionStorage.setItem(SESSION_KEY, 'yes');
      setLoggedIn(true);
      setError('');
      return;
    }
    setError('Неверный логин или пароль. Для теста: admin / admin');
  }

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setStatus('Сохранено локально в этом браузере.');
    setTimeout(() => setStatus(''), 2500);
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    setContent(DEFAULT_CONTENT);
    setStatus('Сброшено к исходной версии.');
  }

  if (!loggedIn) {
    return (
      <main className="admin-page">
        <section className="login-card">
          <p className="eyebrow">TEST ADMIN</p>
          <h1>Вход в админку</h1>
          <p className="muted">Только для инфраструктурного теста. Логин и пароль намеренно захардкожены.</p>
          <form onSubmit={handleLogin} className="login-form">
            <label>
              Логин
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="admin" />
            </label>
            <label>
              Пароль
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin" />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit">Войти</button>
          </form>
          <a className="back-link" href="/">← На сайт</a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page admin-dashboard">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">TEST ADMIN</p>
          <h1>Редактор витрины</h1>
        </div>
        <div className="toolbar-actions">
          <a className="secondary-button" href="/">Открыть сайт</a>
          <button className="secondary-button" onClick={() => { window.sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); }}>Выйти</button>
        </div>
      </div>

      <div className="warning-box">
        Это frontend-only demo: Save пишет данные только в localStorage текущего браузера. Он НЕ делает commit в GitHub и НЕ обновляет другой домен.
      </div>

      <section className="editor-card">
        <label>Название бренда<input value={content.brand} onChange={(e) => setContent({ ...content, brand: e.target.value })} /></label>
        <label>Главный заголовок<input value={content.headline} onChange={(e) => setContent({ ...content, headline: e.target.value })} /></label>
        <label>Описание<textarea value={content.intro} onChange={(e) => setContent({ ...content, intro: e.target.value })} /></label>
      </section>

      <section className="product-editor-grid">
        {content.products.map((product, index) => (
          <article className="editor-card" key={index}>
            <div className="mini-preview"><img src={product.image} alt="" /></div>
            <label>Название<input value={product.title} onChange={(e) => {
              const products = [...content.products];
              products[index] = { ...products[index], title: e.target.value };
              setContent({ ...content, products });
            }} /></label>
            <label>Описание<textarea value={product.caption} onChange={(e) => {
              const products = [...content.products];
              products[index] = { ...products[index], caption: e.target.value };
              setContent({ ...content, products });
            }} /></label>
            <label>Путь / URL картинки<input value={product.image} onChange={(e) => {
              const products = [...content.products];
              products[index] = { ...products[index], image: e.target.value };
              setContent({ ...content, products });
            }} /></label>
          </article>
        ))}
      </section>

      <div className="save-bar">
        <span>{status}</span>
        <button className="secondary-button" onClick={reset}>Reset</button>
        <button onClick={save}>Save</button>
      </div>
    </main>
  );
}
