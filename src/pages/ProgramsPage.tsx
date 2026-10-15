import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import { ExternalLink } from '../components/ExternalLink';
import { Page, PageHeader } from '../components/ui';
import { candidates, measuresOf } from '../data';
import { formatDate, fullName } from '../lib/format';
import { FORMAT_LABEL, PROGRAM_STATUS_LABEL } from '../lib/labels';

const PROGRAM_STATUS_STYLE = {
  publie: 'text-emerald-800 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-400/10',
  partiel: 'text-sky-800 bg-sky-50 dark:text-sky-300 dark:bg-sky-400/10',
  en_cours_d_elaboration: 'text-ink-2 bg-surface-2',
};

export default function ProgramsPage() {
  return (
    <Page>
      <PageHeader eyebrow="Documents officiels" title="Programmes des candidats">
        Le lien vers le programme de chaque candidat, son format, sa date et son état d'avancement. Quand aucun document n'est publié, la
        mention est explicite.
      </PageHeader>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Récapitulatif des programmes</caption>
          <thead className="bg-surface-2 text-ink-3 text-xs">
            <tr>
              {['Candidat', 'Programme', 'Format', 'Publication', 'Statut', 'Livrets', 'Mesures'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const p = c.program;
              const fallback = p.news_url ?? c.website;
              return (
                <tr key={c.id} className="border-line border-t align-top">
                  <th scope="row" className="border-l-4 px-4 py-3 font-normal" style={{ borderLeftColor: c.color }}>
                    <Link to={`/candidats/${c.id}`} className="text-ink font-semibold hover:underline">
                      {fullName(c)}
                    </Link>
                    <span className="text-ink-3 mt-0.5 flex items-center gap-2 text-xs">
                      {c.party_short} <StatusBadge status={c.status} />
                    </span>
                  </th>
                  <td className="px-4 py-3">
                    {p.main_url ? (
                      <ExternalLink href={p.main_url} archive={p.archive_url} className="link font-medium">
                        {p.title ?? 'Programme'}
                      </ExternalLink>
                    ) : (
                      <span className="text-ink-2">
                        Programme pas encore publié
                        {fallback && (
                          <>
                            {' · '}
                            <ExternalLink href={fallback} className="link text-xs">
                              actualité officielle
                            </ExternalLink>
                          </>
                        )}
                      </span>
                    )}
                    {p.archive_url && (
                      <span className="mt-1 block text-xs">
                        <ExternalLink href={p.archive_url} className="link">
                          archive
                        </ExternalLink>
                      </span>
                    )}
                  </td>
                  <td className="text-ink-2 px-4 py-3">{FORMAT_LABEL[p.format]}</td>
                  <td className="text-ink-2 px-4 py-3 whitespace-nowrap">{p.published_date ? formatDate(p.published_date) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${PROGRAM_STATUS_STYLE[p.status]}`}>
                      {PROGRAM_STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="text-ink-2 px-4 py-3">{p.thematic_links.length || '—'}</td>
                  <td className="text-ink-2 px-4 py-3">{measuresOf(c.id).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
