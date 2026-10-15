import type { Candidate, ThemeId } from '../data/schema';
import { themeById } from '../data';
import { formatDate } from '../lib/format';
import { FORMAT_LABEL, PROGRAM_STATUS_LABEL, VERIFICATION_LABEL } from '../lib/labels';
import { ExternalLink } from './ExternalLink';
import { Icon } from './Icon';

const FORMAT_ICON = { page_web: 'web', pdf: 'pdf', livret: 'book', video: 'video', aucun: 'info' } as const;

/** Lien de repli quand aucun programme n'est publié : actualité officielle, sinon site officiel. */
const newsLink = (c: Candidate) => c.program.news_url ?? c.website;

/** Bouton secondaire « Voir le programme » (cartes de la page d'accueil). */
export function ProgramButton({ c }: { c: Candidate }) {
  const p = c.program;
  if (p.main_url) {
    return (
      <ExternalLink
        href={p.main_url}
        archive={p.archive_url}
        className="btn btn-secondary !px-3 !py-1.5 !text-xs"
        title={`${p.title ?? 'Programme'} (${FORMAT_LABEL[p.format]}) – nouvel onglet`}
      >
        <Icon name={FORMAT_ICON[p.format]} className="size-3.5" />
        Voir le programme
        <span className="text-ink-3 text-[10px] font-semibold uppercase">{p.format === 'pdf' ? 'PDF' : 'Web'}</span>
      </ExternalLink>
    );
  }
  const news = newsLink(c);
  return (
    <span className="text-ink-3 inline-flex items-center gap-1.5 text-xs">
      <Icon name="info" className="size-3.5" />
      Programme pas encore publié
      {news && (
        <ExternalLink href={news} className="link">
          actualité
        </ExternalLink>
      )}
    </span>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="text-ink mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Bloc « Programme officiel » en tête de la fiche candidat. */
export function ProgramBlock({ c }: { c: Candidate }) {
  const p = c.program;
  const news = newsLink(c);
  return (
    <section aria-labelledby="programme-officiel" className="card overflow-hidden">
      <div className="h-1" style={{ background: c.color }} aria-hidden />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Programme officiel</p>
            <h2 id="programme-officiel" className="font-display mt-1 text-xl font-semibold sm:text-2xl">
              {p.title ?? (p.main_url ? 'Programme' : 'Programme pas encore publié')}
            </h2>
          </div>
          {p.main_url ? (
            <ExternalLink href={p.main_url} archive={p.archive_url} className="btn btn-primary" bare>
              <Icon name={FORMAT_ICON[p.format]} />
              Lire le programme
              <Icon name="external" className="size-3.5" />
            </ExternalLink>
          ) : (
            news && (
              <ExternalLink href={news} className="btn btn-secondary" bare>
                <Icon name="web" />
                Actualité officielle du candidat
                <Icon name="external" className="size-3.5" />
              </ExternalLink>
            )
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Meta label="Statut">{PROGRAM_STATUS_LABEL[p.status]}</Meta>
          <Meta label="Format">{FORMAT_LABEL[p.format]}</Meta>
          <Meta label="Publication">{p.published_date ? formatDate(p.published_date) : '—'}</Meta>
          <Meta label="Archive">
            {p.archive_url ? (
              <ExternalLink href={p.archive_url} className="link">
                Copie archivée
              </ExternalLink>
            ) : (
              <span className="text-ink-3 font-normal">Non disponible</span>
            )}
          </Meta>
        </dl>

        {p.note && <p className="text-ink-2 bg-surface-2 mt-4 rounded-lg px-3 py-2 text-sm">{p.note}</p>}

        {p.thematic_links.length > 0 && (
          <div className="mt-5">
            <h3 className="eyebrow mb-2">Livrets et pages thématiques</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {p.thematic_links.map((l) => (
                <li key={l.url + l.theme}>
                  <ExternalLink
                    href={l.url}
                    className="border-line hover:bg-surface-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors"
                    bare
                  >
                    <Icon name={FORMAT_ICON[l.format]} className="text-ink-3 size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate font-medium">{l.title}</span>
                      <span className="text-ink-3 text-xs">
                        {themeById.get(l.theme)?.label} · {FORMAT_LABEL[l.format]}
                        {l.page_range ? ` · ${l.page_range}` : ''}
                      </span>
                    </span>
                    <Icon name="external" className="text-ink-3 size-3.5 shrink-0" />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        {p.main_url && p.main_url_verification && (
          <p className="text-ink-3 mt-4 text-xs">Lien principal : {VERIFICATION_LABEL[p.main_url_verification].toLowerCase()}.</p>
        )}
      </div>
    </section>
  );
}

/** « Lire cette partie du programme » : livret du thème, sinon programme principal, sinon mention. */
export function ThemeProgramLink({ c, theme }: { c: Candidate; theme: ThemeId }) {
  const thematic = c.program.thematic_links.find((l) => l.theme === theme);
  if (thematic) {
    return (
      <ExternalLink href={thematic.url} className="link text-sm font-medium">
        Lire cette partie du programme{thematic.page_range ? ` (${thematic.page_range})` : ''}
      </ExternalLink>
    );
  }
  if (c.program.main_url) {
    return (
      <span className="text-sm">
        <ExternalLink href={c.program.main_url} archive={c.program.archive_url} className="link font-medium">
          Lire le programme complet
        </ExternalLink>
        <span className="text-ink-3 block text-xs">Pas de livret dédié à ce thème</span>
      </span>
    );
  }
  return <span className="text-ink-3 text-sm">Pas de document sur ce thème</span>;
}
