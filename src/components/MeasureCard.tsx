import { motion } from 'framer-motion';
import type { Measure } from '../data/schema';
import { formatDate } from '../lib/format';
import { VERIFICATION_LABEL } from '../lib/labels';
import { PrecisionBadge, SourceBadge } from './Badges';
import { ExternalLink } from './ExternalLink';
import { Icon } from './Icon';

/** Une mesure : titre, description, badges, coût éventuel et source précise. */
export function MeasureCard({ m, compact }: { m: Measure; compact?: boolean }) {
  const thirdParty = m.source_type === 'analyse_tierce';
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      id={`mesure-${m.id}`}
      className={`border-line bg-surface rounded-xl border ${compact ? 'p-3.5' : 'p-4'} scroll-mt-24`}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <SourceBadge type={m.source_type} />
        <PrecisionBadge precision={m.precision} />
      </div>
      <h4 className={`text-ink font-semibold ${compact ? 'text-sm' : 'text-[15px]'} leading-snug`}>{m.title}</h4>
      <p className={`text-ink-2 mt-1.5 ${compact ? 'text-[13px]' : 'text-sm'} leading-relaxed`}>{m.description}</p>
      {thirdParty && (
        <p className="mt-2 text-xs text-amber-900 dark:text-amber-300">
          Élément issu d'une analyse tierce : il ne provient pas du candidat.
        </p>
      )}
      {m.cost && (
        <p className="bg-surface-2 text-ink-2 mt-3 rounded-lg px-3 py-2 text-[13px]">
          <span className="text-ink font-medium">Coût estimé : </span>
          {m.cost.label}{' '}
          <span className="text-ink-3">
            (chiffrage :{' '}
            <ExternalLink href={m.cost.source_url} className="link">
              {m.cost.source_label}
            </ExternalLink>
            )
          </span>
        </p>
      )}
      <footer className="text-ink-3 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <ExternalLink href={m.source_url} className="link inline-flex items-center font-medium" bare>
          <Icon name="link" className="mr-1 size-3.5" />
          Source{m.source_page ? ` (${m.source_page})` : ''}
          <Icon name="external" className="ml-1 size-3" />
        </ExternalLink>
        <span>
          {m.source_label} · {formatDate(m.source_date)}
        </span>
        <span title={VERIFICATION_LABEL[m.url_verification]}>Vérifié le {formatDate(m.last_verified)}</span>
      </footer>
    </motion.article>
  );
}

export function NoPosition({ children = 'Pas de position publiée à ce jour' }: { children?: string }) {
  return (
    <div className="border-line text-ink-3 rounded-xl border border-dashed px-4 py-6 text-center text-sm">{children}</div>
  );
}
