/**
 * Teste toutes les URLs des données (programmes, sources, sites…) et produit :
 *  - link-report.md : rapport lisible (cassés, redirections, injoignables) ;
 *  - src/data/link-status.json : statut lu par l'interface (un lien « broken » bascule
 *    sur archive_url s'il existe, sinon « Lien indisponible »).
 *
 * Seuls les 404/410 sont considérés comme cassés. Les autres échecs (403 anti-robot, 5xx,
 * délai dépassé, réseau) sont « injoignables » : signalés dans le rapport sans masquer le lien.
 *
 * Usage : npm run check-links            (derrière un proxy : NODE_USE_ENV_PROXY=1 npm run check-links)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Candidate, MeasuresFile } from '../src/data/schema';

type State = 'ok' | 'redirect' | 'broken' | 'unreachable';
type Result = { state: State; code?: number; final_url?: string; error?: string };

const ROOT = join(import.meta.dirname, '..');
const DATA = join(ROOT, 'src', 'data');
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 8;
const UA = 'Mozilla/5.0 (compatible; presidentielle-2027-comparateur link-checker)';

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

/** url → lieux où elle est utilisée (pour le rapport). */
const usages = new Map<string, string[]>();
const add = (url: string | undefined, where: string) => {
  if (!url) return;
  usages.set(url, [...(usages.get(url) ?? []), where]);
};

for (const f of readdirSync(join(DATA, 'candidates')).filter((x) => x.endsWith('.json'))) {
  const c = readJson<Candidate>(join(DATA, 'candidates', f));
  const p = c.program;
  add(p.main_url, `${c.id} › programme`);
  add(p.archive_url, `${c.id} › archive du programme`);
  add(p.news_url, `${c.id} › actualité`);
  p.thematic_links?.forEach((l) => add(l.url, `${c.id} › livret ${l.theme}`));
  add(c.website, `${c.id} › site`);
  c.socials?.forEach((s) => add(s.url, `${c.id} › ${s.network}`));
  add(c.status_source_url, `${c.id} › statut`);
  add(c.declaration_source_url, `${c.id} › déclaration`);
  c.sources?.forEach((s) => add(s.url, `${c.id} › fiche`));
}
for (const f of readdirSync(join(DATA, 'measures')).filter((x) => x.endsWith('.json'))) {
  const mf = readJson<MeasuresFile>(join(DATA, 'measures', f));
  for (const m of mf.measures) {
    add(m.source_url, `${mf.candidate_id} › ${m.id}`);
    add(m.cost?.source_url, `${mf.candidate_id} › ${m.id} (coût)`);
  }
}

async function request(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*' },
  });
}

async function check(url: string): Promise<Result> {
  try {
    let res = await request(url, 'HEAD');
    // Beaucoup de serveurs refusent HEAD : on retente en GET.
    if (res.status === 405 || res.status === 403 || res.status === 404 || res.status >= 500) res = await request(url, 'GET');
    await res.body?.cancel();
    const final = res.url && res.url.split('#')[0] !== url.split('#')[0] ? res.url : undefined;
    if (res.status === 404 || res.status === 410) return { state: 'broken', code: res.status };
    if (!res.ok) return { state: 'unreachable', code: res.status };
    return final ? { state: 'redirect', code: res.status, final_url: final } : { state: 'ok', code: res.status };
  } catch (e) {
    const err = e as Error & { cause?: { code?: string } };
    return { state: 'unreachable', error: err.name === 'TimeoutError' ? 'délai dépassé' : (err.cause?.code ?? err.message) };
  }
}

const urls = [...usages.keys()];
const results: Record<string, Result> = {};
let done = 0;
async function worker() {
  while (urls.length) {
    const url = urls.shift()!;
    results[url] = await check(url);
    done++;
    if (process.stdout.isTTY) process.stdout.write(`\r${done}/${usages.size} liens testés`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
if (process.stdout.isTTY) process.stdout.write('\n');

const now = new Date().toISOString();
const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));
const offline = Object.values(sorted).every((r) => r.state === 'unreachable');
// Hors ligne, on ne remplace pas le dernier statut connu par un contrôle sans valeur.
if (!offline) writeFileSync(
  join(DATA, 'link-status.json'),
  JSON.stringify(
    {
      checked_at: now,
      results: Object.fromEntries(Object.entries(sorted).map(([u, r]) => [u, { state: r.state, code: r.code, final_url: r.final_url }])),
    },
    null,
    2,
  ) + '\n',
);

const by = (s: State) => Object.entries(sorted).filter(([, r]) => r.state === s);
const archived = new Set(
  readdirSync(join(DATA, 'candidates'))
    .filter((x) => x.endsWith('.json'))
    .map((f) => readJson<Candidate>(join(DATA, 'candidates', f)).program)
    .filter((p) => p.main_url && p.archive_url)
    .map((p) => p.main_url!),
);
const line = (u: string, r: Result, extra = '') =>
  `- ${u}${r.code ? ` — HTTP ${r.code}` : ''}${r.error ? ` — ${r.error}` : ''}${extra}\n  - utilisé par : ${usages.get(u)!.join(' ; ')}`;

const md = [
  '# Rapport de vérification des liens',
  '',
  `Généré le ${now} par \`npm run check-links\`.`,
  '',
  '| État | Nombre |',
  '|---|---|',
  `| OK | ${by('ok').length} |`,
  `| Redirection | ${by('redirect').length} |`,
  `| Cassé (404/410) | ${by('broken').length} |`,
  `| Injoignable (403, 5xx, délai, réseau) | ${by('unreachable').length} |`,
  '',
  '## Liens cassés',
  '',
  ...(by('broken').length
    ? by('broken').map(([u, r]) => line(u, r, archived.has(u) ? ' — **remplacé par la copie archivée**' : ' — **affiché « Lien indisponible »**'))
    : ['Aucun.']),
  '',
  '## Redirections',
  '',
  ...(by('redirect').length ? by('redirect').map(([u, r]) => line(u, r, ` → ${r.final_url}`)) : ['Aucune.']),
  '',
  '## Injoignables (à revérifier manuellement)',
  '',
  ...(by('unreachable').length ? by('unreachable').map(([u, r]) => line(u, r)) : ['Aucun.']),
  '',
].join('\n');
writeFileSync(join(ROOT, 'link-report.md'), md);

console.log(
  `OK ${by('ok').length} · redirections ${by('redirect').length} · cassés ${by('broken').length} · injoignables ${by('unreachable').length} → link-report.md`,
);
if (offline) {
  console.warn('⚠ Aucun lien joignable : vérifiez la connexion réseau ou le proxy (NODE_USE_ENV_PROXY=1). src/data/link-status.json n\'a pas été modifié.');
  process.exit(2);
}
