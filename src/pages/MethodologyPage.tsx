import type { ReactNode } from 'react';
import { PrecisionBadge, SourceBadge } from '../components/Badges';
import { ExternalLink } from '../components/ExternalLink';
import { Page, PageHeader } from '../components/ui';
import { allMeasures, candidates, lastUpdate, linkStatus, themes } from '../data';
import type { Measure } from '../data/schema';
import { formatDate } from '../lib/format';
import { PRECISION_HELP, SOURCE_HELP, VERIFICATION_LABEL } from '../lib/labels';

const REPO_ISSUES = 'https://github.com/coucou123212321232123/Prgramme-politiques/issues';

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-5 sm:p-7">
      <h2 className="font-display mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-ink-2 space-y-3 leading-relaxed [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const total = allMeasures.length;
  const bySource = (t: Measure['source_type']) => allMeasures.filter((x) => x.measure.source_type === t).length;
  const covered = themes.filter((t) => allMeasures.some((x) => x.measure.theme === t.id)).length;
  const verif = (v: Measure['url_verification']) => allMeasures.filter((x) => x.measure.url_verification === v).length;

  return (
    <Page>
      <PageHeader eyebrow="Transparence" title="Méthodologie et sources">
        D'où viennent les données, comment elles sont classées et comment signaler une erreur.
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Dernière mise à jour', formatDate(lastUpdate)],
          ['Candidats', String(candidates.length)],
          ['Mesures sourcées', String(total)],
          ['Thèmes couverts', `${covered} / ${themes.length}`],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="eyebrow">{k}</p>
            <p className="font-display mt-1 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid max-w-4xl gap-5">
        <Section title="Principes">
          <ul>
            <li>Outil indépendant et non officiel, sans lien avec un candidat, un parti ou une institution. Aucune recommandation de vote.</li>
            <li>Même structure et même niveau de détail pour chaque candidat. Les écarts de volume reflètent ce qui est publié et sourcé, sans compensation.</li>
            <li>Pas de source, pas de mesure. Aucune position n'est déduite : sans source, l'outil affiche « Pas de position publiée à ce jour ».</li>
            <li>Les mesures sont reformulées ; les citations éventuelles font moins de 15 mots.</li>
            <li>Les couleurs sont de simples repères visuels. Le positionnement gauche-droite reprend les étiquettes usuelles de la presse et reste indicatif.</li>
            <li>L'ordre d'affichage des candidats est neutre : statut de candidature, puis ordre alphabétique du nom.</li>
          </ul>
        </Section>

        <Section title="Types de sources">
          <p>Le programme officiel est toujours préféré. Les autres sources sont autorisées, mais toujours étiquetées :</p>
          <ul className="!ml-0 space-y-2">
            {(['officiel', 'declaration', 'vote_ou_bilan', 'analyse_tierce'] as const).map((t) => (
              <li key={t} className="!ml-0 flex list-none flex-wrap items-center gap-2">
                <SourceBadge type={t} />
                <span className="text-sm">
                  {SOURCE_HELP[t]} · {bySource(t)} mesure{bySource(t) > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Niveau de précision">
          <ul className="!ml-0 space-y-2">
            {(['chiffre', 'precis', 'orientation_generale'] as const).map((p) => (
              <li key={p} className="!ml-0 flex list-none flex-wrap items-center gap-2">
                <PrecisionBadge precision={p} />
                <span className="text-sm">{PRECISION_HELP[p]}</span>
              </li>
            ))}
          </ul>
          <p>Un coût n'est affiché que s'il existe un chiffrage sourcé, du candidat ou d'un organisme tiers, dont la source est indiquée.</p>
        </Section>

        <Section title="Statut des candidatures">
          <ul>
            <li>
              <strong className="text-ink">Déclaré·e</strong> : annonce officielle de candidature (ou désignation par un parti ou une primaire).
            </li>
            <li>
              <strong className="text-ink">Probable</strong> : intention publiquement exprimée, sans déclaration formelle.
            </li>
            <li>
              <strong className="text-ink">Hypothèse</strong> : candidature évoquée, non confirmée.
            </li>
          </ul>
          <p>
            La liste officielle des candidats ne sera arrêtée qu'après la validation des parrainages par le Conseil constitutionnel. Chaque statut
            porte sa date de vérification et sa source.
          </p>
        </Section>

        <Section title="Vérification des liens">
          <p>Chaque lien enregistré provient d'une page réellement trouvée ; aucune adresse n'est reconstruite ou devinée. Le mode de vérification est conservé pour chaque mesure :</p>
          <ul>
            {(['webfetch', 'search_result', 'check_links'] as const).map((v) => (
              <li key={v}>
                {VERIFICATION_LABEL[v]} : {verif(v)} mesure{verif(v) > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
          <p>
            Le script <code className="bg-surface-2 rounded px-1">npm run check-links</code> teste toutes les adresses et produit un rapport. Un lien cassé
            bascule automatiquement vers sa copie archivée quand elle existe, sinon il est affiché « Lien indisponible ».{' '}
            {linkStatus.checked_at ? `Dernier contrôle : ${formatDate(linkStatus.checked_at.slice(0, 10))}.` : "Aucun contrôle automatique n'a encore été exécuté sur cette version."}
          </p>
        </Section>

        <Section title="Limites connues">
          <ul>
            <li>La campagne est en cours : la plupart des programmes 2027 ne sont pas encore publiés. Une large part des mesures provient de déclarations rapportées par la presse.</li>
            <li>Certaines dates de source ne sont connues qu'au mois ou à l'année près ; elles sont alors affichées ainsi.</li>
            <li>Les photos ne sont affichées que si une image sous licence libre a été vérifiée ; sinon un avatar à initiales est utilisé.</li>
          </ul>
        </Section>

        <Section id="signaler" title="Signaler une erreur">
          <p>
            Une mesure mal résumée, une source cassée, un statut dépassé ? Ouvrez un ticket en indiquant le candidat, la mesure (ou l'adresse de la page) et
            une source officielle.
          </p>
          <p>
            <ExternalLink href={REPO_ISSUES} className="btn btn-primary !inline-flex">
              Signaler une erreur sur GitHub
            </ExternalLink>
          </p>
        </Section>
      </div>
    </Page>
  );
}
