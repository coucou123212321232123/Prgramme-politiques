import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { ExportMenu } from '../components/ExportMenu';
import { ExternalLink } from '../components/ExternalLink';
import { Icon } from '../components/Icon';
import { MeasureCard, NoPosition } from '../components/MeasureCard';
import { MeasureFilters } from '../components/MeasureFilters';
import { ThemeProgramLink } from '../components/Program';
import { PrecisionBadge, SourceBadge } from '../components/Badges';
import { EmptyState, Page, PageHeader } from '../components/ui';
import { candidateById, candidates, measuresOf, themeById, themes } from '../data';
import type { Candidate, Theme, ThemeId } from '../data/schema';
import { fullName } from '../lib/format';
import { applyFilters, hasActiveFilters, useStore } from '../store';

const MAX = 4;

/** État du comparateur, entièrement porté par l'URL (partageable). */
function useCompareState() {
  const [params, setParams] = useSearchParams();
  const themeParam = params.get('theme');
  const theme = themeParam && themeById.has(themeParam as ThemeId) ? themeById.get(themeParam as ThemeId) : undefined;
  const ids = (params.get('c') ?? '')
    .split(',')
    .filter((id) => candidateById.has(id))
    .slice(0, MAX);
  const view = params.get('vue') === 'tableau' ? 'tableau' : 'colonnes';
  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };
  return {
    theme,
    selected: ids.map((id) => candidateById.get(id)!),
    view,
    setTheme: (t: ThemeId) => update({ theme: t }),
    setIds: (list: string[]) => update({ c: list.join(',') || undefined }),
    setView: (v: string) => update({ vue: v === 'tableau' ? 'tableau' : undefined }),
  };
}

function ThemePicker({ current, onPick }: { current?: Theme; onPick: (t: ThemeId) => void }) {
  return (
    <LayoutGroup id="themes">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choisir un thème">
        {themes.map((t) => {
          const on = current?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(t.id)}
              className={`chip relative ${on ? 'text-canvas border-transparent' : 'chip-off'}`}
            >
              {on && (
                <motion.span
                  layoutId="theme-pill"
                  className="bg-ink absolute inset-0 -z-0 rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <Icon name={t.icon} className="relative size-4" />
              <span className="relative">{t.short}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function CandidatePicker({ selected, onChange }: { selected: Candidate[]; onChange: (ids: string[]) => void }) {
  const ids = selected.map((c) => c.id);
  const full = ids.length >= MAX;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Choisir de 2 à ${MAX} candidats`}>
      {candidates.map((c) => {
        const on = ids.includes(c.id);
        return (
          <motion.button
            key={c.id}
            type="button"
            aria-pressed={on}
            disabled={!on && full}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(on ? ids.filter((x) => x !== c.id) : [...ids, c.id])}
            className={`chip !py-1 !pr-3 !pl-1 ${on ? 'bg-surface text-ink border-[var(--c)] ring-1 ring-[var(--c)]' : 'chip-off'} disabled:opacity-40`}
            style={{ '--c': c.color } as React.CSSProperties}
            title={!on && full ? `Maximum ${MAX} candidats` : undefined}
          >
            <span className="relative">
              <CandidateAvatar c={c} size="sm" />
              <AnimatePresence>
                {on && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-ink text-canvas absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full"
                  >
                    <Icon name="check" className="size-2.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            {fullName(c)}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Points de convergence / divergence sur les indicateurs factuels du thème. */
function Indicators({ theme, selected }: { theme: Theme; selected: Candidate[] }) {
  if (!theme.indicators.length || selected.length < 2) return null;
  return (
    <section className="card mb-6 p-4 sm:p-5" aria-labelledby="indicateurs">
      <h2 id="indicateurs" className="eyebrow mb-3">
        Points de comparaison factuels
      </h2>
      <div className="space-y-4">
        {theme.indicators.map((ind) => {
          const values = selected.map((c) => {
            const m = measuresOf(c.id, theme.id).find((x) => x.indicators?.[ind.key]);
            return { c, m, value: m?.indicators?.[ind.key] };
          });
          const known = values.filter((v) => v.value);
          const distinct = new Set(known.map((v) => v.value));
          const verdict = known.length < 2 ? null : distinct.size === 1 ? 'Convergence' : 'Divergence';
          const label = (v: string) => ind.values?.find((x) => x.value === v)?.label ?? `${v}${ind.unit ? ` ${ind.unit}` : ''}`;
          return (
            <div key={ind.key}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-ink text-sm font-medium">{ind.label}</span>
                {verdict && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${verdict === 'Convergence' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-orange-50 text-orange-800 dark:bg-orange-400/10 dark:text-orange-300'}`}
                  >
                    {verdict}
                  </span>
                )}
              </div>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {values.map(({ c, m, value }) => (
                  <li key={c.id} className="bg-surface-2 rounded-lg px-3 py-2 text-sm">
                    <span className="text-ink-3 flex items-center gap-2 text-xs">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden />
                      <span className="truncate">{fullName(c)}</span>
                    </span>
                    <span className={`mt-0.5 block ${value ? 'text-ink font-medium' : 'text-ink-3'}`}>
                      {value && m ? (
                        <a href={`#mesure-${m.id}`} className="hover:underline">
                          {label(value)}
                        </a>
                      ) : (
                        'Non précisé'
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="text-ink-3 mt-3 text-xs">
        Uniquement lorsque la position est explicitement énoncée dans une mesure sourcée. « Non précisé » ne signifie pas une absence de position.
      </p>
    </section>
  );
}

function ColumnHeader({ c }: { c: Candidate }) {
  return (
    <div className="flex items-center gap-3">
      <CandidateAvatar c={c} size="sm" />
      <div className="min-w-0">
        <Link to={`/candidats/${c.id}`} className="text-ink block truncate font-semibold hover:underline">
          {fullName(c)}
        </Link>
        <span className="text-ink-3 block truncate text-xs">{c.party_short}</span>
      </div>
    </div>
  );
}

function Columns({ theme, selected }: { theme: Theme; selected: Candidate[] }) {
  const filters = useStore((s) => s.filters);
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = scroller.current;
    if (el) setActive(Math.round(el.scrollLeft / (el.scrollWidth / selected.length)));
  };
  const cols = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' }[selected.length];
  return (
    <>
      <div
        ref={scroller}
        onScroll={onScroll}
        className={`scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 ${cols}`}
      >
        <AnimatePresence mode="popLayout">
          {selected.map((c) => {
            const all = measuresOf(c.id, theme.id);
            const shown = applyFilters(all, filters);
            return (
              <motion.section
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="card flex w-[85vw] max-w-md shrink-0 snap-center flex-col overflow-hidden md:w-auto md:max-w-none"
                aria-label={fullName(c)}
              >
                <div className="h-1" style={{ background: c.color }} aria-hidden />
                <div className="border-line border-b p-4">
                  <ColumnHeader c={c} />
                  <p className="text-ink-3 mt-2 text-xs">
                    {all.length} mesure{all.length > 1 ? 's' : ''}
                    {hasActiveFilters(filters) && ` · ${shown.length} après filtres`}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  {shown.length ? (
                    shown.map((m) => <MeasureCard key={m.id} m={m} compact />)
                  ) : (
                    <NoPosition>{all.length ? 'Aucune mesure ne correspond aux filtres' : undefined}</NoPosition>
                  )}
                </div>
                <div className="border-line bg-surface-2/50 border-t p-4">
                  <ThemeProgramLink c={c} theme={theme.id} />
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>
      {selected.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {selected.map((c, i) => (
            <span
              key={c.id}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 20 : 6, background: i === active ? c.color : 'var(--color-line)' }}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Table({ theme, selected }: { theme: Theme; selected: Candidate[] }) {
  const filters = useStore((s) => s.filters);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">Mesures du thème {theme.label} par candidat</caption>
        <thead className="bg-surface-2 text-ink-3 text-xs">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Candidat</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mesure</th>
            <th scope="col" className="px-4 py-3 font-semibold">Source</th>
            <th scope="col" className="px-4 py-3 font-semibold">Précision</th>
            <th scope="col" className="px-4 py-3 font-semibold">Coût estimé</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((c) => {
            const shown = applyFilters(measuresOf(c.id, theme.id), filters);
            const rows = shown.length ? shown : [null];
            return rows.map((m, i) => (
              <tr key={c.id + (m?.id ?? 'none')} className={`border-line align-top ${i === 0 ? 'border-t' : ''}`}>
                {i === 0 && (
                  <th scope="rowgroup" rowSpan={rows.length} className="w-52 border-l-4 px-4 py-3 font-normal" style={{ borderLeftColor: c.color }}>
                    <ColumnHeader c={c} />
                    <div className="mt-3">
                      <ThemeProgramLink c={c} theme={theme.id} />
                    </div>
                  </th>
                )}
                {m ? (
                  <>
                    <td className="px-4 py-3">
                      <p className="text-ink font-medium">{m.title}</p>
                      <p className="text-ink-2 mt-1 text-[13px]">{m.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge type={m.source_type} />
                      <div className="mt-1.5 text-xs">
                        <ExternalLink href={m.source_url} className="link">
                          {m.source_label}
                          {m.source_page ? ` (${m.source_page})` : ''}
                        </ExternalLink>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PrecisionBadge precision={m.precision} />
                    </td>
                    <td className="text-ink-2 px-4 py-3 text-[13px]">{m.cost ? m.cost.label : <span className="text-ink-3">—</span>}</td>
                  </>
                ) : (
                  <td colSpan={4} className="text-ink-3 px-4 py-3">
                    {measuresOf(c.id, theme.id).length ? 'Aucune mesure ne correspond aux filtres' : 'Pas de position publiée à ce jour'}
                  </td>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePage() {
  const { theme, selected, view, setTheme, setIds, setView } = useCompareState();
  const [showFilters, setShowFilters] = useState(false);
  const filters = useStore((s) => s.filters);
  const exportRef = useRef<HTMLDivElement>(null);
  const exportName = useMemo(
    () => `comparaison-${theme?.id ?? 'theme'}-${selected.map((c) => c.last_name.toLowerCase().replace(/\W+/g, '-')).join('-')}`,
    [theme, selected],
  );

  return (
    <Page>
      <PageHeader eyebrow="Comparateur" title="Comparer les mesures par thème">
        Choisissez un thème puis 2 à {MAX} candidats. Les mesures s'affichent côte à côte avec leur source.
      </PageHeader>

      <div className="card mb-6 space-y-5 p-4 sm:p-5">
        <div>
          <h2 className="eyebrow mb-3">1. Thème</h2>
          <ThemePicker current={theme} onPick={setTheme} />
        </div>
        <div>
          <h2 className="eyebrow mb-3">
            2. Candidats <span className="normal-case">({selected.length}/{MAX})</span>
          </h2>
          <CandidatePicker selected={selected} onChange={setIds} />
        </div>
      </div>

      {!theme ? (
        <EmptyState title="Choisissez un thème pour commencer">Par exemple « Énergie », puis sélectionnez les candidats à comparer.</EmptyState>
      ) : selected.length === 0 ? (
        <EmptyState title={`Sélectionnez des candidats à comparer sur « ${theme.label} »`}>De 2 à {MAX} candidats.</EmptyState>
      ) : (
        <>
          <div className="no-print mb-4 flex flex-wrap items-center gap-2">
            <div className="bg-surface-2 inline-flex rounded-full p-1" role="radiogroup" aria-label="Mode d'affichage">
              {(['colonnes', 'tableau'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={`relative rounded-full px-3 py-1.5 text-xs font-medium ${view === v ? 'text-ink' : 'text-ink-3'}`}
                >
                  {view === v && <motion.span layoutId="view-pill" className="bg-surface absolute inset-0 rounded-full shadow-sm" />}
                  <span className="relative inline-flex items-center gap-1.5">
                    <Icon name={v === 'colonnes' ? 'columns' : 'table'} className="size-3.5" />
                    {v === 'colonnes' ? 'Colonnes' : 'Tableau'}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`btn !py-1.5 !text-xs ${showFilters || hasActiveFilters(filters) ? 'btn-primary' : 'btn-secondary'}`}
              aria-expanded={showFilters}
              onClick={() => setShowFilters((s) => !s)}
            >
              <Icon name="filter" className="size-3.5" /> Filtres{hasActiveFilters(filters) && ' (actifs)'}
            </button>
            <div className="ml-auto">
              <ExportMenu target={exportRef} filename={exportName} />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="no-print overflow-hidden"
              >
                <div className="card mb-4 p-4">
                  <MeasureFilters />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={exportRef} className="bg-canvas">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">{theme.label}</h2>
              {selected.length === 1 && <p className="text-ink-3 text-sm">Ajoutez au moins un autre candidat pour comparer.</p>}
            </div>
            <Indicators theme={theme} selected={selected} />
            {view === 'colonnes' ? <Columns theme={theme} selected={selected} /> : <Table theme={theme} selected={selected} />}
          </div>
        </>
      )}
    </Page>
  );
}
