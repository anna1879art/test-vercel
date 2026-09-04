'use client';

import { useEffect, useState } from 'react';

import { DEFAULT_CONTENT, STORAGE_KEY, type SiteContent } from './content';

export default function HomePage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setContent(JSON.parse(saved));
    } catch {
      // Test project: fall back to bundled defaults.
    }
  }, []);

  return (
    <main>
      <header className="hero">
        <div className="nav-shell">
          <a className="brand" href="#top">{content.brand}</a>
          <nav>
            <a href="#collection">Коллекция</a>
            <a href="#about">О проекте</a>
            <a className="admin-link" href="/admin/">Admin</a>
          </nav>
        </div>

        <div className="hero-copy" id="top">
          <p className="eyebrow">HANDMADE · TEST STOREFRONT</p>
          <h1>{content.headline}</h1>
          <p>{content.intro}</p>
          <a className="cta" href="#collection">Смотреть коллекцию</a>
        </div>
      </header>

      <section className="section" id="collection">
        <div className="section-heading">
          <p className="eyebrow">COLLECTION</p>
          <h2>Наши свечи</h2>
        </div>
        <div className="gallery">
          {content.products.map((product, index) => (
            <article className="card" key={`${product.title}-${index}`}>
              <div className="image-frame">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="card-copy">
                <span>0{index + 1}</span>
                <h3>{product.title}</h3>
                <p>{product.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about section" id="about">
        <p className="eyebrow">ABOUT</p>
        <h2>Небольшая витрина для теста инфраструктуры</h2>
        <p>
          Эта версия специально не содержит базы данных и backend. Её можно собрать в полностью статические файлы,
          разместить на обычном hosting и параллельно деплоить через Vercel.
        </p>
      </section>

      <footer>
        <strong>{content.brand}</strong>
        <span>Test project · 2026</span>
      </footer>
    </main>
  );
}
