# Schéma des données

Source de vérité : `src/data/schema.ts` (Zod). Ce document le résume.

```
src/data/
  themes.json                 20 thèmes (+ indicateurs de convergence)
  candidates/<id>.json        une fiche par candidat (objet Candidate)
  measures/<id>.json          { "candidate_id": "<id>", "measures": Measure[] }
```

## Candidate (`candidates/<id>.json`)

| Champ | Type | Remarque |
|---|---|---|
| `id` | slug | ex. `marine-le-pen` (= nom du fichier) |
| `first_name`, `last_name` | texte | |
| `status` | `declare` \| `probable` \| `hypothese` | |
| `status_note` | texte ? | précision factuelle (ex. « désigné par la primaire du 11/10/2026 ») |
| `status_source_url` | URL | article ou déclaration qui établit le statut |
| `status_verified` | date | |
| `birth_date` | date ? | l'âge est calculé à l'affichage |
| `party`, `party_short` | texte | ex. « Rassemblement national », « RN » |
| `family` | `extreme-gauche` \| `gauche` \| `ecologiste` \| `centre` \| `droite` \| `souverainiste` \| `extreme-droite` | filtre de la page d'accueil |
| `position` | `extreme-gauche` \| `gauche-radicale` \| `gauche` \| `centre-gauche` \| `centre` \| `centre-droit` \| `droite` \| `droite-souverainiste` \| `extreme-droite` | échelle indicative, étiquettes usuelles de la presse |
| `color` | `#RRGGBB` | repère visuel uniquement |
| `photo` | `{url, credit, license}` ? | uniquement Wikimedia Commons vérifié ; sinon avatar à initiales |
| `bio` | texte | 2 à 4 phrases neutres |
| `current_roles`, `past_roles` | texte[] | |
| `team` | `{name, role}[]` | dirigeants, porte-paroles, directeur de campagne |
| `slogan` | texte ? | seulement s'il est officiel |
| `key_axes` | texte[] (≤ 5) | axes revendiqués par le candidat |
| `website` | URL ? | |
| `socials` | `{network, url}[]` | `x`, `instagram`, `facebook`, `youtube`, `tiktok`, `bluesky`, `linkedin`, `threads` |
| `declaration_date`, `declaration_source_url` | date ?, URL ? | |
| `program` | Program | **obligatoire** |
| `sources` | `{label, url}[]` | sources des informations biographiques |
| `last_verified` | date | |

### Program

| Champ | Type |
|---|---|
| `title` | intitulé officiel (ex. « L'Avenir en commun ») |
| `main_url` | URL de la page/PDF principal (absent si rien de publié) |
| `main_url_verification` | `webfetch` \| `search_result` \| `check_links` |
| `format` | `page_web` \| `pdf` \| `livret` \| `video` \| `aucun` |
| `published_date` | date |
| `status` | `publie` \| `partiel` \| `en_cours_d_elaboration` |
| `thematic_links[]` | `{theme, title, url, format, page_range?, url_verification}` |
| `archive_url` | copie Wayback Machine |
| `news_url` | page d'actualité officielle (si programme non publié) |
| `note` | précision factuelle |

## Measure (`measures/<id>.json`)

| Champ | Type | Remarque |
|---|---|---|
| `id` | slug unique dans le fichier | ex. `energie-relance-epr` |
| `title` | ≤ 120 caractères | reformulé, neutre |
| `description` | 1 à 3 phrases | reformulée, sans citation de plus de 15 mots |
| `theme` | id de thème | |
| `source_type` | `officiel` (programme / site du candidat ou du parti) \| `declaration` (interview, discours, tribune) \| `vote_ou_bilan` (proposition de loi, vote, bilan) \| `analyse_tierce` (fact-checking, think tank) | |
| `source_label` | texte | ex. « Programme L'Avenir en commun, chap. 3 » ou « Interview, Le Parisien » |
| `source_url` | URL https | `#page=N` pour les PDF quand c'est possible |
| `source_date` | date | |
| `source_page` | texte ? | « p. 42 », « #energie » |
| `url_verification` | `webfetch` \| `search_result` \| `check_links` | |
| `precision` | `chiffre` \| `precis` \| `orientation_generale` | |
| `cost` | `{label, source_label, source_url}` ? | seulement si un chiffrage sourcé existe |
| `indicators` | `{ <clé>: <valeur> }` ? | clés définies dans `themes.json` (`nucleaire`, `age_legal`, `smic_net`, `impot_fortune`, `proportionnelle`), seulement si la mesure l'énonce explicitement |
| `last_verified` | date | |

Règles : pas de source = pas de mesure ; aucune URL inventée ou reconstruite ; si rien n'est publié sur un thème, on n'ajoute rien (l'interface affiche « Pas de position publiée à ce jour »).
