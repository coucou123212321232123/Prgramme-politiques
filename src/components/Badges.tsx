import type { Candidate, Measure } from '../data/schema';
import { PRECISION_HELP, PRECISION_LABEL, SOURCE_HELP, SOURCE_LABEL, STATUS_HELP, STATUS_LABEL } from '../lib/labels';

const SOURCE_STYLE: Record<Measure['source_type'], string> = {
  officiel: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  declaration: 'bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
  vote_ou_bilan: 'bg-violet-50 text-violet-800 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25',
  analyse_tierce: 'bg-amber-50 text-amber-900 ring-amber-600/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
};

const base = 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

export function SourceBadge({ type }: { type: Measure['source_type'] }) {
  return (
    <span className={`${base} ${SOURCE_STYLE[type]}`} title={SOURCE_HELP[type]}>
      {SOURCE_LABEL[type]}
    </span>
  );
}

export function PrecisionBadge({ precision }: { precision: Measure['precision'] }) {
  const dots = { chiffre: 3, precis: 2, orientation_generale: 1 }[precision];
  return (
    <span className={`${base} bg-surface-2 text-ink-2 ring-line`} title={PRECISION_HELP[precision]}>
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`size-1.5 rounded-full ${i < dots ? 'bg-current' : 'bg-current/20'}`} />
        ))}
      </span>
      {PRECISION_LABEL[precision]}
    </span>
  );
}

const STATUS_STYLE: Record<Candidate['status'], string> = {
  declare: 'bg-ink text-canvas ring-transparent',
  probable: 'bg-surface text-ink ring-ink/40',
  hypothese: 'bg-surface text-ink-3 ring-line',
};

export function StatusBadge({ status }: { status: Candidate['status'] }) {
  return (
    <span className={`${base} ${STATUS_STYLE[status]}`} title={STATUS_HELP[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}
