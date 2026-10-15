import { z } from 'zod';

/** Date ISO AAAA-MM-JJ (ou AAAA-MM / AAAA quand le jour n'est pas connu). */
const isoDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Date ISO attendue (AAAA-MM-JJ)');
const url = z.string().url().startsWith('https://', 'URL https attendue');

export const THEME_IDS = [
  'economie',
  'fiscalite',
  'emploi',
  'retraites',
  'energie',
  'ecologie',
  'agriculture',
  'logement',
  'sante',
  'education',
  'securite',
  'immigration',
  'institutions',
  'europe',
  'international',
  'numerique',
  'culture',
  'outre-mer',
  'services-publics',
  'famille',
] as const;
export const ThemeId = z.enum(THEME_IDS);
export type ThemeId = z.infer<typeof ThemeId>;

/**
 * Comment l'URL a été confirmée :
 * - `webfetch` : page ouverte et contenu vérifié ;
 * - `search_result` : URL renvoyée telle quelle par un moteur de recherche avec un extrait correspondant
 *   (page indexée, non ouverte directement) ;
 * - `check_links` : confirmée par le script `npm run check-links`.
 */
export const UrlVerification = z.enum(['webfetch', 'search_result', 'check_links']);

export const IndicatorDef = z.object({
  key: z.string(),
  label: z.string(),
  /** Valeurs possibles (catégorielles) ; absent = valeur libre (ex. un âge). */
  values: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  unit: z.string().optional(),
});

export const Theme = z.object({
  id: ThemeId,
  label: z.string(),
  short: z.string(),
  description: z.string(),
  icon: z.string(),
  indicators: z.array(IndicatorDef).default([]),
});
export type Theme = z.infer<typeof Theme>;

export const SourceType = z.enum(['officiel', 'declaration', 'vote_ou_bilan', 'analyse_tierce']);
export type SourceType = z.infer<typeof SourceType>;
export const Precision = z.enum(['chiffre', 'precis', 'orientation_generale']);
export type Precision = z.infer<typeof Precision>;

export const Measure = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(600),
  theme: ThemeId,
  source_type: SourceType,
  /** Intitulé lisible de la source (ex. « Projet 2027, livret Énergie », « Interview au Parisien »). */
  source_label: z.string().min(2),
  source_url: url,
  source_date: isoDate,
  source_page: z.string().optional(),
  url_verification: UrlVerification,
  precision: Precision,
  cost: z
    .object({
      label: z.string(),
      source_label: z.string(),
      source_url: url,
    })
    .optional(),
  /** Position factuelle sur un indicateur du thème (cf. themes.json), pour la convergence/divergence. */
  indicators: z.record(z.string(), z.string()).optional(),
  last_verified: isoDate,
});
export type Measure = z.infer<typeof Measure>;

export const MeasuresFile = z.object({
  candidate_id: z.string(),
  measures: z.array(Measure),
});
export type MeasuresFile = z.infer<typeof MeasuresFile>;

export const ProgramLink = z.object({
  theme: ThemeId,
  title: z.string(),
  url,
  format: z.enum(['page_web', 'pdf', 'livret', 'video']),
  page_range: z.string().optional(),
  url_verification: UrlVerification,
});

export const Program = z.object({
  title: z.string().optional(),
  main_url: url.optional(),
  main_url_verification: UrlVerification.optional(),
  format: z.enum(['page_web', 'pdf', 'livret', 'video', 'aucun']),
  published_date: isoDate.optional(),
  status: z.enum(['publie', 'partiel', 'en_cours_d_elaboration']),
  thematic_links: z.array(ProgramLink).default([]),
  archive_url: url.optional(),
  /** Page d'actualité officielle quand le programme n'est pas publié. */
  news_url: url.optional(),
  note: z.string().optional(),
});
export type Program = z.infer<typeof Program>;

export const POSITIONS = [
  'extreme-gauche',
  'gauche-radicale',
  'gauche',
  'centre-gauche',
  'centre',
  'centre-droit',
  'droite',
  'droite-souverainiste',
  'extreme-droite',
] as const;
export const Position = z.enum(POSITIONS);
export type Position = z.infer<typeof Position>;

export const FAMILIES = [
  'extreme-gauche',
  'gauche',
  'ecologiste',
  'centre',
  'droite',
  'souverainiste',
  'extreme-droite',
] as const;
export const Family = z.enum(FAMILIES);
export type Family = z.infer<typeof Family>;

export const Candidate = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  first_name: z.string(),
  last_name: z.string(),
  status: z.enum(['declare', 'probable', 'hypothese']),
  status_note: z.string().optional(),
  status_source_url: url,
  status_verified: isoDate,
  birth_date: isoDate.optional(),
  party: z.string(),
  party_short: z.string(),
  family: Family,
  position: Position,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  photo: z
    .object({ url, credit: z.string(), license: z.string() })
    .optional(),
  bio: z.string(),
  current_roles: z.array(z.string()).default([]),
  past_roles: z.array(z.string()).default([]),
  team: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
  slogan: z.string().optional(),
  key_axes: z.array(z.string()).max(5).default([]),
  website: url.optional(),
  socials: z
    .array(z.object({ network: z.enum(['x', 'instagram', 'facebook', 'youtube', 'tiktok', 'bluesky', 'linkedin', 'threads']), url }))
    .default([]),
  declaration_date: isoDate.optional(),
  declaration_source_url: url.optional(),
  program: Program,
  sources: z.array(z.object({ label: z.string(), url })).default([]),
  last_verified: isoDate,
});
export type Candidate = z.infer<typeof Candidate>;
