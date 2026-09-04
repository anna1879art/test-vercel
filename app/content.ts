export type SiteSection = { id: string; title: string; description: string; image: string };
export type SiteContent = {
  siteTitle: string;
  heroTitle: string;
  heroDescription: string;
  sections: SiteSection[];
};

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function validateSiteContent(value: unknown): SiteContent {
  if (!value || typeof value !== 'object') throw new Error('Invalid site data');
  const data = value as Partial<SiteContent>;
  if (!isString(data.siteTitle, 120)) throw new Error('Site title is required (maximum 120 characters)');
  if (!isString(data.heroTitle, 200)) throw new Error('Hero title is required (maximum 200 characters)');
  if (!isString(data.heroDescription, 2000)) throw new Error('Hero description is required (maximum 2000 characters)');
  if (!Array.isArray(data.sections) || data.sections.length < 1 || data.sections.length > 20) {
    throw new Error('The site must contain between 1 and 20 sections');
  }
  const ids = new Set<string>();
  const sections = data.sections.map((section, index) => {
    if (!section || typeof section !== 'object') throw new Error(`Section ${index + 1} is invalid`);
    if (!isString(section.id, 80) || !/^[a-zA-Z0-9_-]+$/.test(section.id)) throw new Error(`Section ${index + 1} has an invalid id`);
    if (ids.has(section.id)) throw new Error(`Section id "${section.id}" is duplicated`);
    ids.add(section.id);
    if (!isString(section.title, 160)) throw new Error(`Section ${index + 1} title is required`);
    if (!isString(section.description, 2000)) throw new Error(`Section ${index + 1} description is required`);
    if (!isString(section.image, 500)) throw new Error(`Section ${index + 1} image path is required`);
    return { id: section.id, title: section.title, description: section.description, image: section.image };
  });
  return { siteTitle: data.siteTitle, heroTitle: data.heroTitle, heroDescription: data.heroDescription, sections };
}
