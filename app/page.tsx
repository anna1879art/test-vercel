import siteJson from '../data/site.json';
import { validateSiteContent } from './content';

export default function HomePage() {
  const content = validateSiteContent(siteJson);
  return <main>
    <header className="hero">
      <div className="nav-shell"><a className="brand" href="#top">{content.siteTitle}</a><nav><a href="#collection">Коллекция</a><a href="#about">О проекте</a><a className="admin-link" href="/admin/">Admin</a></nav></div>
      <div className="hero-copy" id="top"><p className="eyebrow">HANDMADE · TEST STOREFRONT</p><h1>{content.heroTitle}</h1><p>{content.heroDescription}</p><a className="cta" href="#collection">Смотреть коллекцию</a></div>
    </header>
    <section className="section" id="collection"><div className="section-heading"><p className="eyebrow">COLLECTION</p><h2>Наши свечи</h2></div><div className="gallery">
      {content.sections.map((section, index) => <article className="card" key={section.id}><div className="image-frame"><img src={section.image} alt={section.title} /></div><div className="card-copy"><span>{String(index + 1).padStart(2, '0')}</span><h3>{section.title}</h3><p>{section.description}</p></div></article>)}
    </div></section>
    <section className="about section" id="about"><p className="eyebrow">ABOUT</p><h2>Небольшая витрина для теста инфраструктуры</h2><p>GitHub хранит редактируемые данные сайта. Одно сохранение в админке создаёт один commit, после которого Vercel разворачивает обновлённую витрину.</p></section>
    <footer><strong>{content.siteTitle}</strong><span>Test project · 2026</span></footer>
  </main>;
}
