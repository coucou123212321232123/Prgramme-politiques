import type { Candidate } from '../data/schema';
import { fullName, initials } from '../lib/format';

const SIZES = { sm: 'size-8 text-xs', md: 'size-12 text-base', lg: 'size-20 text-2xl sm:size-24 sm:text-3xl' };

/** Photo libre de droits si renseignée, sinon avatar à initiales sur la couleur du candidat. */
export function CandidateAvatar({ c, size = 'md' }: { c: Candidate; size?: keyof typeof SIZES }) {
  if (c.photo) {
    return (
      <img
        src={c.photo.url}
        alt={`Portrait de ${fullName(c)} (${c.photo.credit}, ${c.photo.license})`}
        className={`${SIZES[size]} shrink-0 rounded-full object-cover ring-2 ring-[var(--c)]`}
        style={{ '--c': c.color } as React.CSSProperties}
        loading="lazy"
      />
    );
  }
  return (
    <span
      className={`${SIZES[size]} font-display inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ background: `linear-gradient(135deg, ${c.color}, color-mix(in oklab, ${c.color} 70%, black))` }}
      role="img"
      aria-label={`Initiales de ${fullName(c)}`}
    >
      {initials(c.first_name, c.last_name)}
    </span>
  );
}
