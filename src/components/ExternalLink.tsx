import type { ReactNode } from 'react';
import { linkState } from '../data';
import { Icon } from './Icon';

type Props = {
  href: string;
  /** Copie archivée utilisée si le lien principal est signalé cassé par `npm run check-links`. */
  archive?: string;
  children: ReactNode;
  className?: string;
  /** Masque l'icône « lien externe » (quand le contenu en porte déjà une). */
  bare?: boolean;
  title?: string;
};

/**
 * Lien sortant : nouvel onglet, `noopener noreferrer`, indicateur visuel et repli automatique
 * sur l'archive (ou mention « Lien indisponible ») quand le contrôle des liens l'a marqué cassé.
 */
export function ExternalLink({ href, archive, children, className = 'link', bare, title }: Props) {
  const broken = linkState(href) === 'broken';
  const target = broken ? archive : href;
  if (!target) {
    return (
      <span className="text-ink-3 inline-flex items-center gap-1 text-sm" title={`Lien signalé indisponible : ${href}`}>
        <Icon name="alert" className="size-3.5" /> Lien indisponible
      </span>
    );
  }
  return (
    <a href={target} target="_blank" rel="noopener noreferrer" className={className} title={title}>
      {children}
      {broken && <span className="ml-1 text-xs">(copie archivée)</span>}
      {!bare && <Icon name="external" className="ml-1 inline size-3.5 shrink-0 align-[-2px]" />}
      <span className="sr-only"> (ouvre un nouvel onglet)</span>
    </a>
  );
}
