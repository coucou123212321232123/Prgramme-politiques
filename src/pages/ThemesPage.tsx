import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { Icon } from '../components/Icon';
import { MeasureCard } from '../components/MeasureCard';
import { MeasureFilters } from '../components/MeasureFilters';
import { ThemeProgramLink } from '../components/Program';
import { Page, PageHeader } from '../components/ui';
import { candidates, measuresOf, themes } from '../data';
import type { Candidate, Measure, Theme } from '../data/schema';
import { fullName } from '../lib/format';
import { applyFilters, useStore } from '../store';

const RANK = { officiel: 0, vote_ou_bilan: 1, declaration: 2, analyse_tierce: 3 };
const PREC = { chiffre: 0, precis: 1, orientation_generale: 2 };
/** Mesure mise en avant dans la cellule : source officielle et précision maximales d'abord. */
const lead = (ms: Measure[]) => [...ms].sort((a, b) => RANK[a.source_type] - RANK[b.source_type] || PREC[a.precision] - PREC[b.precision])[0];

function CellDetail({ c, t, onClose }: { c: Candidate; t: Theme; onClose: () => void }) {
  const filters = useStore((s) => s.filters);
  const ms = applyFilters(measuresOf(c.id, t.id), filters);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Fermer" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="bg-canvas relative flex h-full w-full max-w-lg flex-col shadow-2xl"
      >
        <div className="h-1" style={{ background: c.color }} />
        <div className="border-line flex items-start gap-3 border-b p-5">
          <CandidateAvatar c={c} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-ink-3 text-xs">{t.label}</p>
            <h2 id="detail-title" className="font-display text-xl font-semibold">
              {fullName(c)}
            </h2>
          </div>
          <button type="button" className="btn btn-ghost !p-2" onClick={onClose} aria-label="Fermer le détail" autoFocus>
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {ms.length ? ms.map((m) => <MeasureCard key={m.id} m={m} compact />) : <p className="text-ink-3 text-sm">Pas de position publiée à ce jour</p>}
        </div>
        <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t p-5">
          <ThemeProgramLink c={c} theme={t.id} />
          <Link to={`/comparateur?theme=${t.id}&c=${c.id}`} className="btn btn-secondary !text-xs">
            <Icon name="columns" className="size-3.5" /> Comparer
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function ThemesPage() {
  const filters = useStore((s) => s.filters);
  const [cell, setCell] = useState<{ c: Candidate; t: Theme } | null>(null);
  return (
    <Page>
      <PageHeader eyebrow="Comparateur global" title="Tous les thèmes, tous les candidats">
        Une ligne par thème, une colonne par candidat. Chaque cellule résume la mesure la plus précise issue de la source la plus directe ;
        cliquez pour voir le détail.
      </PageHeader>
      <div className="card mb-4 p-4">
        <MeasureFilters />
      </div>
      <div className="card relative overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <table className="w-max min-w-full border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">Matrice des mesures par thème et par candidat</caption>
          <thead>
            <tr>
              <th scope="col" className="bg-surface border-line sticky top-0 left-0 z-30 w-44 border-r border-b px-4 py-3 text-xs font-semibold">
                Thème
              </th>
              {candidates.map((c) => (
                <th key={c.id} scope="col" className="bg-surface border-line sticky top-0 z-20 w-56 min-w-56 border-b px-3 py-3 font-normal">
                  <Link to={`/candidats/${c.id}`} className="flex items-center gap-2 hover:underline">
                    <span className="h-6 w-1 rounded-full" style={{ background: c.color }} aria-hidden />
                    <span className="min-w-0">
                      <span className="text-ink block truncate text-sm font-semibold">{fullName(c)}</span>
                      <span className="text-ink-3 block text-xs">{c.party_short}</span>
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {themes.map((t) => (
              <tr key={t.id}>
                <th scope="row" className="bg-surface border-line sticky left-0 z-10 border-r border-b px-4 py-3 align-top font-normal">
                  <Link to={`/comparateur?theme=${t.id}`} className="text-ink flex items-center gap-2 font-medium hover:underline">
                    <Icon name={t.icon} className="text-ink-3 size-4 shrink-0" />
                    {t.short}
                  </Link>
                </th>
                {candidates.map((c) => {
                  const ms = applyFilters(measuresOf(c.id, t.id), filters);
                  const m = lead(ms);
                  return (
                    <td key={c.id} className="border-line border-b p-1.5 align-top">
                      {m ? (
                        <button
                          type="button"
                          onClick={() => setCell({ c, t })}
                          className="hover:bg-surface-2 h-full w-full rounded-lg p-2 text-left transition-colors"
                          aria-label={`${fullName(c)}, ${t.label} : ${ms.length} mesure(s). Voir le détail`}
                        >
                          <span className="text-ink line-clamp-3 text-[13px] leading-snug">{m.title}</span>
                          {ms.length > 1 && <span className="text-ink-3 mt-1 block text-xs">+ {ms.length - 1} autre{ms.length > 2 ? 's' : ''}</span>}
                        </button>
                      ) : (
                        <span className="text-ink-3/70 block p-2 text-xs">Pas de position publiée</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>{cell && <CellDetail key="detail" c={cell.c} t={cell.t} onClose={() => setCell(null)} />}</AnimatePresence>
    </Page>
  );
}
