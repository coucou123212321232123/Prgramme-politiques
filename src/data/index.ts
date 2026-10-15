/**
 * Point d'accès unique aux données. Les fichiers JSON sont validés au build par
 * `npm run validate-data` (schémas Zod de ./schema.ts) ; ici on se contente de les typer.
 */
import type { Candidate, Measure, MeasuresFile, Theme, ThemeId } from './schema';
import themesJson from './themes.json';
import linkStatusJson from './link-status.json';

const candidateModules = import.meta.glob<Candidate>('./candidates/*.json', { eager: true, import: 'default' });
const measureModules = import.meta.glob<MeasuresFile>('./measures/*.json', { eager: true, import: 'default' });

export const themes = themesJson as Theme[];
export const themeById = new Map(themes.map((t) => [t.id, t]));

const STATUS_ORDER = { declare: 0, probable: 1, hypothese: 2 } as const;
const POSITION_ORDER = [
  'extreme-gauche',
  'gauche-radicale',
  'gauche',
  'centre-gauche',
  'centre',
  'centre-droit',
  'droite',
  'droite-souverainiste',
  'extreme-droite',
];

/** Tri neutre : statut, puis ordre alphabétique du nom de famille. */
export const candidates: Candidate[] = Object.values(candidateModules).sort(
  (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.last_name.localeCompare(b.last_name, 'fr'),
);
export const candidateById = new Map(candidates.map((c) => [c.id, c]));

export const positionIndex = (c: Candidate) => POSITION_ORDER.indexOf(c.position);

const measuresByCandidate = new Map<string, Measure[]>();
for (const file of Object.values(measureModules)) measuresByCandidate.set(file.candidate_id, file.measures);

export function measuresOf(candidateId: string, theme?: ThemeId): Measure[] {
  const all = measuresByCandidate.get(candidateId) ?? [];
  return theme ? all.filter((m) => m.theme === theme) : all;
}

export const allMeasures: { candidate: Candidate; measure: Measure }[] = candidates.flatMap((candidate) =>
  measuresOf(candidate.id).map((measure) => ({ candidate, measure })),
);

/** Date de mise à jour affichée : la vérification la plus récente. */
export const lastUpdate: string = [...candidates.map((c) => c.last_verified), ...allMeasures.map((x) => x.measure.last_verified)]
  .sort()
  .at(-1) ?? '2026-10-15';

export type LinkState = 'ok' | 'redirect' | 'broken' | 'unreachable';
type LinkStatusFile = { checked_at: string | null; results: Record<string, { state: LinkState; code?: number; final_url?: string }> };
export const linkStatus = linkStatusJson as LinkStatusFile;

export function linkState(url: string | undefined): LinkState | undefined {
  return url ? linkStatus.results[url]?.state : undefined;
}

export type { Candidate, Measure, Theme, ThemeId };
