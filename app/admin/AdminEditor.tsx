'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, STORAGE_KEY, type SiteContent } from '../content';

export default function AdminEditor() {
  const [status, setStatus] = useState('');
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setContent(JSON.parse(saved));
    } catch {
      // Use defaults.
    }
  }, []);

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

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
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
          <button className="secondary-button" onClick={logout}>Выйти</button>
        </div>
      </div>

      <div className="warning-box">
        Логин теперь проверяется сервером Vercel через Environment Variables. Само редактирование всё ещё demo-only: Save пишет данные только в localStorage текущего браузера и не делает commit в GitHub.
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
