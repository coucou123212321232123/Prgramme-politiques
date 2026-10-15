const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « 2026-10-15 » → « 15 octobre 2026 » (gère aussi AAAA-MM et AAAA). */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!m) return String(y);
  if (!d) return `${MONTHS[m - 1]} ${y}`;
  return `${d === 1 ? '1er' : d} ${MONTHS[m - 1]} ${y}`;
}

/** « 2026-10-15 » → « 15/10/2026 ». */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return [d, m, y].filter(Boolean).join('/');
}

export function ageOn(birth: string | undefined, on = new Date()): number | undefined {
  if (!birth || birth.length < 10) return undefined;
  const b = new Date(birth);
  let age = on.getFullYear() - b.getFullYear();
  const m = on.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < b.getDate())) age--;
  return age;
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last.replace(/^(de |d')/i, '')[0] ?? ''}`.toUpperCase();
}

export const fullName = (c: { first_name: string; last_name: string }) => `${c.first_name} ${c.last_name}`;

/** Normalisation pour la recherche plein texte (casse et accents). */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
