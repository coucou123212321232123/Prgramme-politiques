/**
 * Valide toutes les données de src/data avec les schémas Zod.
 * Usage : npm run validate-data [-- <candidate-id> ...]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { Candidate, MeasuresFile, Theme, THEME_IDS } from '../src/data/schema';

const DATA = join(import.meta.dirname, '..', 'src', 'data');
const only = process.argv.slice(2);
const errors: string[] = [];
const warnings: string[] = [];

function load(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path} : JSON invalide (${(e as Error).message})`);
    return undefined;
  }
}

function check<T>(schema: z.ZodType<T>, data: unknown, where: string): T | undefined {
  const res = schema.safeParse(data);
  if (!res.success) {
    for (const issue of res.error.issues) errors.push(`${where} › ${issue.path.join('.') || '(racine)'} : ${issue.message}`);
    return undefined;
  }
  return res.data;
}

const themes = check(z.array(Theme), load(join(DATA, 'themes.json')), 'themes.json') ?? [];
if (themes.length && themes.length !== THEME_IDS.length) errors.push(`themes.json : ${themes.length} thèmes au lieu de ${THEME_IDS.length}`);
const indicatorDefs = new Map(themes.flatMap((t) => t.indicators.map((i) => [i.key, { theme: t.id, def: i }] as const)));

const candidateFiles = readdirSync(join(DATA, 'candidates')).filter((f) => f.endsWith('.json'));
const measureFiles = new Set(readdirSync(join(DATA, 'measures')).filter((f) => f.endsWith('.json')));
let measureCount = 0;

for (const file of candidateFiles) {
  const id = file.replace(/\.json$/, '');
  if (only.length && !only.includes(id)) continue;
  const c = check(Candidate, load(join(DATA, 'candidates', file)), `candidates/${file}`);
  if (!c) continue;
  if (c.id !== id) errors.push(`candidates/${file} : id « ${c.id} » différent du nom de fichier`);
  const p = c.program;
  if (p.status !== 'en_cours_d_elaboration' && !p.main_url) errors.push(`candidates/${file} › program.main_url requis quand le programme est publié`);
  if (!p.main_url && !p.news_url && !c.website) warnings.push(`candidates/${file} › program : ni main_url, ni news_url, ni site officiel`);
  if (p.main_url && !p.main_url_verification) errors.push(`candidates/${file} › program.main_url_verification manquant`);

  if (!measureFiles.has(file)) {
    warnings.push(`measures/${file} absent : aucune mesure pour ${id}`);
    continue;
  }
  const mf = check(MeasuresFile, load(join(DATA, 'measures', file)), `measures/${file}`);
  if (!mf) continue;
  if (mf.candidate_id !== id) errors.push(`measures/${file} : candidate_id « ${mf.candidate_id} » ≠ ${id}`);
  const seen = new Set<string>();
  for (const m of mf.measures) {
    const where = `measures/${file} › ${m.id}`;
    if (seen.has(m.id)) errors.push(`${where} : id en double`);
    seen.add(m.id);
    for (const [key, value] of Object.entries(m.indicators ?? {})) {
      const ind = indicatorDefs.get(key);
      if (!ind) errors.push(`${where} : indicateur inconnu « ${key} »`);
      else if (ind.theme !== m.theme) errors.push(`${where} : indicateur « ${key} » réservé au thème ${ind.theme}`);
      else if (ind.def.values && !ind.def.values.some((v) => v.value === value)) errors.push(`${where} : valeur « ${value} » invalide pour ${key}`);
    }
    if (m.description.split(/\s+/).length > 120) warnings.push(`${where} : description longue`);
  }
  measureCount += mf.measures.length;
}

for (const f of measureFiles) {
  if (!candidateFiles.includes(f)) errors.push(`measures/${f} : aucun candidat correspondant`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\n${errors.length} erreur(s).`);
  process.exit(1);
}
console.log(`✔ Données valides : ${themes.length} thèmes, ${candidateFiles.length} candidats, ${measureCount} mesures.`);
