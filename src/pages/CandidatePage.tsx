import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { ExternalLink } from '../components/ExternalLink';
import { Icon } from '../components/Icon';
import { MeasureCard, NoPosition } from '../components/MeasureCard';
import { MeasureFilters } from '../components/MeasureFilters';
import { ProgramBlock } from '../components/Program';
import { EmptyState, Page, PositionScale } from '../components/ui';
import { candidateById, measuresOf, themes } from '../data';
import type { Candidate, Theme } from '../data/schema';
import { ageOn, formatDate, fullName, hostname } from '../lib/format';
import { FAMILY_LABEL, PROGRAM_STATUS_LABEL } from '../lib/labels';
import { applyFilters, hasActiveFilters, useStore } from '../store';

const NETWORK_LABEL: Record<string, string> = {
  x: 'X (Twitter)',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  bluesky: 'Bluesky',
  linkedin: 'LinkedIn',
  threads: 'Threads',
};

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="eyebrow mb-2">{title}</h3>
      <ul className="text-ink-2 space-y-1.5 text-sm">
        {items.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="bg-ink-3 mt-2 size-1 shrink-0 rounded-full" aria-hidden />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThemeAccordion({ c, theme, open, onToggle }: { c: Candidate; theme: Theme; open: boolean; onToggle: () => void }) {
  const filters = useStore((s) => s.filters);
  const all = measuresOf(c.id, theme.id);
  const shown = applyFilters(all, filters);
  const panelId = `theme-panel-${theme.id}`;
  return (
    <div className="card overflow-hidden" id={`theme-${theme.id}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="hover:bg-surface-2 flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5"
        >
          <span className="bg-surface-2 text-ink-2 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon name={theme.icon} className="size-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-ink block font-medium">{theme.label}</span>
            <span className="text-ink-3 block text-xs">
              {all.length
                ? `${all.length} mesure${all.length > 1 ? 's' : ''}${hasActiveFilters(filters) ? ` · ${shown.length} après filtres` : ''}`
                : 'Pas de position publiée à ce jour'}
            </span>
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-ink-3">
            <Icon name="down" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-line grid gap-3 border-t p-4 sm:p-5 lg:grid-cols-2">
              {shown.length ? (
                shown.map((m) => <MeasureCard key={m.id} m={m} />)
              ) : (
                <div className="lg:col-span-2">
                  <NoPosition>{all.length ? 'Aucune mesure ne correspond aux filtres' : undefined}</NoPosition>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                <Link to={`/comparateur?theme=${theme.id}&c=${c.id}`} className="btn btn-secondary !py-1.5 !text-xs">
                  <Icon name="columns" className="size-3.5" /> Comparer sur ce thème
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CandidatePage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const c = candidateById.get(id);
  const initialTheme = params.get('theme');
  const [open, setOpen] = useState<Set<string>>(() => new Set(initialTheme ? [initialTheme] : []));

  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' }), 350);
    return () => clearTimeout(t);
  }, [hash]);

  if (!c) {
    return (
      <Page>
        <EmptyState title="Candidat introuvable" icon="alert">
          <Link to="/" className="link">
            Retour à la liste des candidats
          </Link>
        </EmptyState>
      </Page>
    );
  }

  const age = ageOn(c.birth_date);
  const total = measuresOf(c.id).length;
  const covered = themes.filter((t) => measuresOf(c.id, t.id).length);
  const toggle = (tid: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(tid)) n.delete(tid);
      else n.add(tid);
      return n;
    });

  return (
    <Page>
      <Link to="/" className="text-ink-3 hover:text-ink mb-6 inline-flex items-center gap-1.5 text-sm">
        <Icon name="arrowLeft" /> Tous les candidats
      </Link>

      <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="flex items-start gap-5">
          <CandidateAvatar c={c} size="lg" />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              <span className="text-ink-3 text-xs">Statut vérifié le {formatDate(c.status_verified)}</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{fullName(c)}</h1>
            <p className="text-ink-2 mt-1">
              {c.party}
              {!c.party.includes(c.party_short) && ` (${c.party_short})`} · {FAMILY_LABEL[c.family]}
              {age !== undefined && ` · ${age} ans`}
            </p>
            {c.slogan && <p className="font-display text-ink-2 mt-3 text-lg italic">« {c.slogan} »</p>}
          </div>
        </div>
        <div className="card p-4">
          <p className="eyebrow mb-3">Positionnement indicatif</p>
          <PositionScale c={c} />
          {c.position_note && <p className="text-ink-3 mt-2 text-xs">{c.position_note}</p>}
        </div>
      </header>

      {c.status_note && (
        <p className="text-ink-2 bg-surface-2 mb-6 rounded-xl px-4 py-3 text-sm">
          <Icon name="info" className="mr-1.5 inline size-4 align-[-3px]" />
          {c.status_note}{' '}
          <ExternalLink href={c.status_source_url} className="link">
            Source
          </ExternalLink>
        </p>
      )}

      <ProgramBlock c={c} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2" aria-labelledby="parcours">
          <h2 id="parcours" className="font-display mb-3 text-xl font-semibold">
            Parcours
          </h2>
          <p className="text-ink-2 leading-relaxed">{c.bio}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoList title="Fonctions actuelles" items={c.current_roles} />
            <InfoList title="Fonctions passées" items={c.past_roles} />
          </div>
          {c.key_axes.length > 0 && (
            <div className="mt-6">
              <h3 className="eyebrow mb-3">Axes principaux du projet</h3>
              <ol className="grid gap-2 sm:grid-cols-2">
                {c.key_axes.map((a, i) => (
                  <li key={a} className="bg-surface-2 flex gap-3 rounded-xl p-3 text-sm">
                    <span className="font-display text-lg leading-none font-semibold" style={{ color: c.color }}>
                      {i + 1}
                    </span>
                    <span className="text-ink-2">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <aside className="card space-y-6 p-5 sm:p-6" aria-label="Informations pratiques">
          {c.team.length > 0 && (
            <div>
              <h3 className="eyebrow mb-2">Équipe et soutiens clés</h3>
              <ul className="space-y-2 text-sm">
                {c.team.map((t) => (
                  <li key={t.name + t.role}>
                    <span className="text-ink font-medium">{t.name}</span>
                    <span className="text-ink-3 block text-xs">{t.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="eyebrow mb-2">Candidature</h3>
            <p className="text-ink-2 text-sm">
              {c.declaration_date ? (
                <>
                  Déclarée le {formatDate(c.declaration_date)}
                  {c.declaration_source_url && (
                    <>
                      {' '}
                      ·{' '}
                      <ExternalLink href={c.declaration_source_url} className="link">
                        source
                      </ExternalLink>
                    </>
                  )}
                </>
              ) : (
                'Pas de déclaration formelle à ce jour'
              )}
            </p>
          </div>
          {(c.website || c.socials.length > 0) && (
            <div>
              <h3 className="eyebrow mb-2">Sites et réseaux officiels</h3>
              <ul className="space-y-1.5 text-sm">
                {c.website && (
                  <li>
                    <ExternalLink href={c.website} className="link">
                      {hostname(c.website)}
                    </ExternalLink>
                  </li>
                )}
                {c.socials.map((s) => (
                  <li key={s.url}>
                    <ExternalLink href={s.url} className="link">
                      {NETWORK_LABEL[s.network]}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.sources.length > 0 && (
            <div>
              <h3 className="eyebrow mb-2">Sources de la fiche</h3>
              <ul className="space-y-1.5 text-xs">
                {c.sources.map((s) => (
                  <li key={s.url}>
                    <ExternalLink href={s.url} className="link">
                      {s.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-ink-3 text-xs">Fiche vérifiée le {formatDate(c.last_verified)}.</p>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="programme-themes">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="programme-themes" className="font-display text-2xl font-semibold">
              Programme par thème
            </h2>
            <p className="text-ink-3 mt-1 text-sm">
              {total} mesure{total > 1 ? 's' : ''} sourcée{total > 1 ? 's' : ''} · {covered.length} thème
              {covered.length > 1 ? 's' : ''} sur {themes.length} couverts · programme : {PROGRAM_STATUS_LABEL[c.program.status].toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost !text-xs" onClick={() => setOpen(new Set(covered.map((t) => t.id)))}>
              Tout déplier
            </button>
            <button type="button" className="btn btn-ghost !text-xs" onClick={() => setOpen(new Set())}>
              Tout replier
            </button>
          </div>
        </div>
        <div className="card mb-4 p-4">
          <MeasureFilters />
        </div>
        <div className="space-y-3">
          {themes.map((t) => (
            <ThemeAccordion key={t.id} c={c} theme={t} open={open.has(t.id)} onToggle={() => toggle(t.id)} />
          ))}
        </div>
      </section>
    </Page>
  );
}
