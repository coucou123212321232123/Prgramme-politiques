# Présidentielle 2027 – Comparateur de programmes

Outil **indépendant et non officiel** qui centralise les informations sur les candidats à l'élection présidentielle française de 2027 et permet de comparer leurs mesures par thème, avec une source pour chacune.

Application 100 % statique (Vite, React, TypeScript, Tailwind CSS, Framer Motion, React Router, Zustand). Pas de backend ni de base de données : les données vivent dans `src/data/`.

## Installation et lancement

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # valide les données, vérifie les types, construit dist/
npm run preview        # sert dist/
npm run validate-data  # valide les données (schémas Zod)
npm run check-links    # teste toutes les URLs, écrit link-report.md et src/data/link-status.json
```

Derrière un proxy d'entreprise : `NODE_USE_ENV_PROXY=1 npm run check-links`.

Le routage par ancre (`/#/comparateur?...`) permet d'héberger `dist/` sur n'importe quel serveur statique (GitHub Pages, Netlify, etc.) sans configuration.

## Application installable (PWA)

L'application est une **Progressive Web App** : elle s'installe comme une app native et fonctionne **hors ligne** (toutes les données sont embarquées ; seuls les liens vers les sources externes nécessitent une connexion).

- **Ordinateur (Chrome, Edge)** : bouton « Installer » dans l'en-tête, ou icône d'installation dans la barre d'adresse.
- **Android (Chrome)** : bouton « Installer », ou menu ⋮ → « Installer l'application ».
- **iPhone / iPad (Safari)** : bouton « Installer » (affiche la marche à suivre) → Partager → « Sur l'écran d'accueil ».

Quand une nouvelle version des données est publiée, l'app propose « Mettre à jour » (vérification toutes les heures).

L'installation requiert un hébergement en **HTTPS** (ou `localhost`) : `npm run build`, puis déployer `dist/` sur GitHub Pages, Netlify, Vercel, etc. Pour tester localement : `npm run build && npm run preview`.

Fichiers concernés : configuration `VitePWA` dans `vite.config.ts` (manifeste, raccourcis, cache), icônes dans `public/icons/`, composants `src/components/Pwa.tsx`.

## Fonctionnalités

| Page | Contenu |
|---|---|
| **Candidats** (`/`) | Cartes candidats, filtres famille / statut, recherche plein texte (candidats, partis et mesures), bouton « Voir le programme » |
| **Fiche candidat** (`/candidats/:id`) | Bloc « Programme officiel », parcours, fonctions, équipe, axes, sites et réseaux, programme par thème (accordéons) avec filtres |
| **Comparateur** (`/comparateur?theme=energie&c=a,b,c&vue=tableau`) | Thème + 2 à 4 candidats, vue colonnes ou tableau, swipe horizontal sur mobile, points de convergence et de divergence, lien « Lire cette partie du programme », partage d'URL, export image et PDF |
| **Thèmes** (`/themes`) | Matrice thèmes × candidats, résumé d'une ligne par cellule, détail au clic |
| **Programmes** (`/programmes`) | Tableau récapitulatif : lien, format, date, statut, livrets |
| **Méthodologie** (`/methodologie`) | Origine et classement des données, statistiques, signalement d'erreur |

## Données

```
src/data/
  schema.ts               schémas Zod (source de vérité)
  themes.json             20 thèmes et indicateurs de convergence
  candidates/<id>.json    une fiche par candidat
  measures/<id>.json      { "candidate_id": "<id>", "measures": [...] }
  link-status.json        généré par `npm run check-links`
```

Le schéma complet est décrit dans [SCHEMA.md](SCHEMA.md).

### Ajouter ou mettre à jour un candidat

1. Créer `src/data/candidates/<id>.json` (l'`id` est un slug identique au nom du fichier, ex. `jean-dupont`) en suivant [SCHEMA.md](SCHEMA.md). Le bloc `program` est obligatoire. Si rien n'est publié : `"status": "en_cours_d_elaboration"`, `"format": "aucun"` et, si possible, `news_url` vers la page d'actualité officielle.
2. Créer `src/data/measures/<id>.json` avec `{ "candidate_id": "<id>", "measures": [] }`.
3. Lancer `npm run validate-data -- <id>`.

L'ordre d'affichage est automatique et neutre : statut, puis ordre alphabétique.

### Mettre à jour un programme

Dans la fiche du candidat, modifier `program` :
- `main_url`, `title`, `format`, `published_date`, `status` ;
- `thematic_links[]` : un objet par livret ou page thématique (`theme`, `title`, `url`, `format`, `page_range`) ; c'est ce lien qu'ouvre « Lire cette partie du programme » dans le comparateur ;
- `archive_url` : une copie Wayback Machine (`https://web.archive.org/web/...`), utilisée automatiquement si `check-links` détecte que le lien principal est cassé.

### Ajouter une mesure

Ajouter un objet dans `measures/<id>.json` :

```json
{
  "id": "energie-relance-epr",
  "title": "Construire de nouveaux réacteurs EPR2",
  "description": "Reformulation neutre en 1 à 3 phrases.",
  "theme": "energie",
  "source_type": "officiel",
  "source_label": "Projet 2027, livret Énergie",
  "source_url": "https://exemple-officiel.fr/livret-energie.pdf#page=12",
  "source_date": "2026-10-01",
  "source_page": "p. 12",
  "url_verification": "webfetch",
  "precision": "chiffre",
  "indicators": { "nucleaire": "relance" },
  "last_verified": "2026-10-15"
}
```

Règles éditoriales :
- **pas de source, pas de mesure** ; jamais d'URL devinée ou reconstruite ;
- reformuler, sans citation de plus de 15 mots ;
- préférer le document officiel à un article de presse ; une déclaration rapportée par un média est une `declaration`, et `source_label` nomme le média ;
- `indicators` uniquement si la mesure énonce explicitement la position (clés définies dans `themes.json`) ;
- mettre à jour `last_verified` à chaque vérification.

Puis lancer `npm run validate-data` et `npm run check-links`.

### Vérifier les liens

`npm run check-links` teste chaque URL (HEAD, puis GET) et classe les résultats :
- **cassé** (404/410) : l'interface bascule sur `archive_url` si elle existe, sinon elle affiche « Lien indisponible » ;
- **redirection** : à mettre à jour dans les données ;
- **injoignable** (403 anti-robot, 5xx, délai, réseau) : signalé dans le rapport, le lien reste affiché.

Sans aucun accès réseau, le script n'écrase pas `link-status.json` et se termine avec le code 2.

## Accessibilité et design

Navigation au clavier, focus visibles, rôles ARIA (onglets radio, accordéons `aria-expanded`, boîte de dialogue), lien d'évitement, textes alternatifs, contraste AA (les couleurs des candidats ne servent qu'aux accents, jamais au texte), mode sombre, animations désactivées si `prefers-reduced-motion`.

## Licence des données

Les mesures sont des reformulations ; chaque source reste la propriété de son éditeur. Signaler une erreur : [tickets GitHub](https://github.com/coucou123212321232123/Prgramme-politiques/issues).
