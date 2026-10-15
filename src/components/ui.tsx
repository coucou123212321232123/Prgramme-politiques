import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { POSITION_LABEL } from '../lib/labels';
import type { Candidate } from '../data/schema';

/** Conteneur de page animé (transition d'entrée/sortie). */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      id="contenu"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 ${className}`}
    >
      {children}
    </motion.main>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="text-ink-2 mt-3 text-base leading-relaxed sm:text-lg">{children}</div>}
    </div>
  );
}

export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } },
};

const SCALE: Candidate['position'][] = [
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

/** Repère indicatif sur l'axe gauche-droite. */
export function PositionScale({ c, compact }: { c: Candidate; compact?: boolean }) {
  const i = SCALE.indexOf(c.position);
  const pct = (i / (SCALE.length - 1)) * 100;
  return (
    <div className={compact ? '' : 'w-full'}>
      <div
        className="bg-surface-2 relative h-1.5 rounded-full"
        role="img"
        aria-label={`Positionnement indicatif : ${POSITION_LABEL[c.position]}`}
      >
        {i >= 0 && (
          <span
            className="ring-surface absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
            style={{ left: `${pct}%`, background: c.color }}
          />
        )}
      </div>
      {!compact && (
        <div className="text-ink-3 mt-1.5 flex justify-between text-[11px]">
          <span>Gauche</span>
          <span className="text-ink-2 font-medium">{POSITION_LABEL[c.position]}</span>
          <span>Droite</span>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-surface-2 animate-pulse rounded-xl motion-reduce:animate-none ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6" aria-busy="true" aria-label="Chargement">
      <Skeleton className="mb-3 h-4 w-32" />
      <Skeleton className="mb-8 h-10 w-2/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, children, icon = 'search' }: { title: string; children?: ReactNode; icon?: string }) {
  return (
    <div className="border-line flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-surface-2 text-ink-3 mb-4 flex size-12 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          {icon === 'search' ? <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" /> : <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />}
        </svg>
      </span>
      <p className="text-ink font-medium">{title}</p>
      {children && <div className="text-ink-3 mt-1 max-w-md text-sm">{children}</div>}
    </div>
  );
}
