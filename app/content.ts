export type SiteContent = {
  brand: string;
  headline: string;
  intro: string;
  products: Array<{ title: string; caption: string; image: string }>;
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: 'Anna Candle Studio',
  headline: 'Свечи как маленькие арт-объекты ?',
  intro: 'Тестовая одностраничная визитка для проверки GitHub → Vercel → static export → hosting.',
  products: [
    { title: 'Blue Structure', caption: 'Фактурная свеча в холодных синих оттенках.', image: '/images/blue-cube.png' },
    { title: 'Citrus Collection', caption: 'Яркая композиция с фруктовым настроением.', image: '/images/orange-set.png' },
    { title: 'Crystal Night', caption: 'Тёмная декоративная чаша с мягким свечением.', image: '/images/dark-bowl.png' },
    { title: 'Sushi Collection', caption: 'Игровая коллекция декоративных свечей.', image: '/images/sushi-set.png' }
  ]
};

export const STORAGE_KEY = 'candle-card-content-v1';
