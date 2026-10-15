import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { StatusBadge } from '../components/Badges';
import { Icon } from '../components/Icon';
import { ProgramButton } from '../components/Program';
import { EmptyState, Page, PositionScale, stagger } from '../components/ui';
import { allMeasures, candidates, measuresOf, themeById, themes } from '../data';
import type { Candidate } from '../data/schema';
import { ageOn, fullName, normalize } from '../lib/format';
import { FAMILY_LABEL, STATUS_LABEL } from '../lib/labels';

const FAMILIES = Object.keys(FAMILY_LABEL).filter((f) => candidates.some((c) => c.family === f)) as Candidate['family'][];
const STATUSES = (['declare', 'probable', 'hypothese'] as const).filter((s) => candidates.some((c) => c.status === s));

function CandidateCard({ c }: { c: Candidate }) {
  const count = measuresOf(c.id).length;
  const age = ageOn(c.birth_date);
  return (
    <motion.li variants={stagger.item} className="h-full">
      <article
        className="card group relative flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-lift)]"
        style={{ '--c': c.color } as React.CSSProperties}
      >
        <div className="h-1 w-full bg-[var(--c)]" aria-hidden />
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-4">
            <CandidateAvatar c={c} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg leading-tight font-semibold">
                <Link to={`/candidats/${c.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                  {fullName(c)}
                </Link>
              </h2>
              <p className="text-ink-2 mt-0.5 truncate text-sm">
                {c.party}
                {age !== undefined && <span className="text-ink-3"> · {age} ans</span>}
              </p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          {c.slogan ? (
            <p className="text-ink-2 font-display mt-4 line-clamp-2 text-[15px] italic">« {c.slogan} »</p>
          ) : (
            c.key_axes[0] && <p className="text-ink-2 mt-4 line-clamp-2 text-sm">{c.key_axes.slice(0, 2).join(' · ')}</p>
          )}
          <div className="mt-auto pt-5">
            <PositionScale c={c} />
            <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2">
              <ProgramButton c={c} />
              <span className="text-ink-3 text-xs">
                {count} mesure{count > 1 ? 's' : ''} sourcée{count > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </article>
    </motion.li>
  );
}

function SearchResults({ q }: { q: string }) {
  const nq = normalize(q);
  const hits = useMemo(
    () =>
      allMeasures
        .filter(({ measure: m, candidate: c }) =>
          normalize(`${m.title} ${m.description} ${fullName(c)} ${themeById.get(m.theme)?.label}`).includes(nq),
        )
        .slice(0, 40),
    [nq],
  );
  const themeHits = themes.filter((t) => normalize(t.label).includes(nq));
  if (!hits.length && !themeHits.length) return null;
  return (
    <section aria-labelledby="resultats-mesures" className="mt-10">
      <h2 id="resultats-mesures" className="eyebrow mb-3">
        Mesures correspondantes ({hits.length}
        {hits.length === 40 ? '+' : ''})
      </h2>
      {themeHits.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {themeHits.map((t) => (
            <Link key={t.id} to={`/comparateur?theme=${t.id}`} className="chip chip-off">
              <Icon name={t.icon} /> Comparer : {t.label}
            </Link>
          ))}
        </div>
      )}
      <ul className="grid gap-2 md:grid-cols-2">
        {hits.map(({ candidate: c, measure: m }) => (
          <li key={c.id + m.id}>
            <Link
              to={`/candidats/${c.id}?theme=${m.theme}#mesure-${m.id}`}
              className="card hover:bg-surface-2 flex gap-3 p-3.5 transition-colors"
            >
              <span className="mt-1 h-auto w-1 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden />
              <span className="min-w-0">
                <span className="text-ink-3 block text-xs">
                  {fullName(c)} · {themeById.get(m.theme)?.short}
                </span>
                <span className="text-ink block text-sm font-medium">{m.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  const [q, setQ] = useState('');
  const [families, setFamilies] = useState<Candidate['family'][]>([]);
  const [statuses, setStatuses] = useState<Candidate['status'][]>([]);

  const nq = normalize(q.trim());
  const shown = candidates.filter(
    (c) =>
      (!families.length || families.includes(c.family)) &&
      (!statuses.length || statuses.includes(c.status)) &&
      (!nq || normalize(`${fullName(c)} ${c.party} ${c.party_short}`).includes(nq)),
  );
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Page>
      <section className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-3">Élection présidentielle · avril 2027</p>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Les candidats et leurs programmes, <span className="text-ink-3">thème par thème.</span>
          </h1>
          <p className="text-ink-2 mt-4 max-w-xl text-lg">
            Chaque mesure est reformulée, datée et reliée à sa source. Comparez jusqu'à quatre candidats sur un même sujet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link to="/comparateur" className="btn btn-primary">
            <Icon name="columns" /> Comparer par thème
          </Link>
          <Link to="/themes" className="btn btn-secondary">
            <Icon name="grid" /> Vue d'ensemble
          </Link>
        </div>
      </section>

      <div className="card mb-8 flex flex-col gap-4 p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Rechercher un candidat, un parti ou une mesure</span>
          <Icon name="search" className="text-ink-3 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un candidat, un parti, une mesure (ex. « nucléaire », « SMIC »)…"
            className="input !pl-11"
          />
        </label>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par famille politique">
            <span className="eyebrow mr-1">Famille</span>
            {FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={families.includes(f)}
                onClick={() => setFamilies(toggle(families, f))}
                className={`chip !py-1 !text-xs ${families.includes(f) ? 'chip-on' : 'chip-off'}`}
              >
                {FAMILY_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par statut">
            <span className="eyebrow mr-1">Statut</span>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={statuses.includes(s)}
                onClick={() => setStatuses(toggle(statuses, s))}
                className={`chip !py-1 !text-xs ${statuses.includes(s) ? 'chip-on' : 'chip-off'}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-ink-3 mb-4 text-sm" aria-live="polite">
        {shown.length} candidat{shown.length > 1 ? 's' : ''} · ordre : statut, puis alphabétique
      </p>
      {shown.length ? (
        <motion.ul
          key={`${families.join()}|${statuses.join()}`}
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((c) => (
            <CandidateCard key={c.id} c={c} />
          ))}
        </motion.ul>
      ) : (
        <EmptyState title="Aucun candidat ne correspond">Modifiez la recherche ou les filtres.</EmptyState>
      )}

      {nq.length >= 3 && <SearchResults q={q.trim()} />}
    </Page>
  );
}
