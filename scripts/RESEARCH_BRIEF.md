# Consignes de recherche (agents)

Contexte : application « Présidentielle 2027 – Comparateur de programmes ». Date du jour : 15 octobre 2026.
Premier tour prévu le 18 avril 2027 (à confirmer par les sources).

## Outils
- Utilise **WebSearch** (mode "standard", "extended" si les résultats sont maigres ou anciens). Lance plusieurs recherches dans le même tour quand c'est possible.
- Essaie **WebFetch** une seule fois au début : dans cet environnement il échoue en général (DNS). S'il échoue, n'insiste pas.
- Une URL n'est enregistrable que si elle apparaît **telle quelle** dans la liste "Links" d'un résultat WebSearch (ou a été ouverte avec WebFetch). Ne reconstruis, ne devine, ne raccourcis jamais une URL. Pas d'ancre `#page=N` inventée : seulement si tu connais réellement le numéro de page.
- `url_verification` = `"webfetch"` si ouverte via WebFetch, sinon `"search_result"`.

## Ce qu'il faut produire (fichiers JSON, UTF-8, indentés 2 espaces)
1. `src/data/candidates/<id>.json` : la fiche candidat.
2. `src/data/measures/<id>.json` : `{ "candidate_id": "<id>", "measures": [...] }`.
Le format exact est dans `SCHEMA.md` et `src/data/schema.ts` (lis-les d'abord). Les thèmes valides sont dans `src/data/themes.json`.
Vérifie ton travail avec `npm run validate-data -- <id>` (depuis /home/user/Prgramme-politiques) jusqu'à ce que ce soit vert.
Ne modifie AUCUN autre fichier. Ne fais pas de commit git.

## Priorités de recherche
1. Statut de candidature au 15/10/2026 (déclaré / probable / hypothèse) avec la date et une URL d'article.
2. Programme officiel : titre, URL (site de campagne, site du parti, PDF), date, statut (publié, partiel, en cours d'élaboration), livrets thématiques. S'il n'y a pas de programme 2027 publié, mets `status: "en_cours_d_elaboration"`, `format: "aucun"`, pas de `main_url`, et renseigne `news_url` (page officielle d'actualité du candidat ou du parti) si tu la trouves dans les résultats. Si une copie Wayback Machine (web.archive.org/web/...) apparaît dans les résultats, mets-la dans `archive_url`, sinon omets le champ.
3. Fiche : date de naissance, parti, fonctions actuelles/passées, équipe (président du parti, directeur de campagne, porte-paroles), slogan officiel s'il existe, 3 à 5 axes revendiqués, site officiel, réseaux officiels (URL vues dans les résultats uniquement).
4. Mesures : vise 3 à 6 mesures par thème quand elles existent, sur un maximum des 20 thèmes, en priorisant énergie, retraites, économie, fiscalité, immigration, sécurité, santé, éducation, Europe, défense, institutions, logement, écologie. Objectif : 30 à 60 mesures par candidat principal (moins si peu de matière publiée — ne comble jamais les vides).
   - Source prioritaire : programme ou site officiel (`officiel`). Sinon interview/discours/tribune (`declaration`), proposition de loi/vote/bilan (`vote_ou_bilan`), ou analyse tierce (`analyse_tierce`, ex. Les Décodeurs, Institut Montaigne, IPP, Fondapol). Une mesure issue d'un article de presse qui rapporte un propos du candidat est une `declaration` ; `source_label` doit alors nommer le média et la nature (« Interview à Ouest-France »).
   - Les mesures 2027 priment. Une mesure du programme 2022 ne peut être reprise que si elle est explicitement présentée comme telle (`source_label` « Programme présidentiel 2022 ») et seulement si aucune source 2027 n'existe sur le thème — préfère t'abstenir.
   - Reformule en tes mots, ton neutre, factuel, sans adjectif évaluatif. Citation éventuelle < 15 mots entre guillemets.
   - `precision` : `chiffre` (montant, âge, nombre…), `precis` (dispositif identifiable sans chiffre), `orientation_generale` (intention).
   - `cost` seulement si un chiffrage sourcé existe (par le candidat ou un organisme tiers, à nommer dans `source_label`).
   - `indicators` seulement si la mesure l'énonce explicitement : `energie.nucleaire` ∈ relance|maintien|sortie ; `retraites.age_legal` = nombre en texte (ex. "60") ; `economie.smic_net` = montant en texte (ex. "1600") ; `fiscalite.impot_fortune` ∈ retablir|contre ; `institutions.proportionnelle` ∈ integrale|partielle|contre.
   - `last_verified` = "2026-10-15".
5. Positionnement (`position`, `family`) : utilise l'étiquette communément employée par la presse généraliste ; c'est une échelle indicative.
6. `photo` : omets le champ (avatar à initiales par défaut).

## Neutralité
Même structure et même ton pour tous les candidats. Aucun jugement, aucune qualification positive ou négative, aucune inférence de position non publiée.

## Compte rendu final (bref, en français)
Statut retenu + source, programme trouvé ou non, nombre de mesures par thème, thèmes sans aucune source, points incertains.
