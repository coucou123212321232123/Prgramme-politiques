import type { Candidate, Measure, Program } from '../data/schema';

export const STATUS_LABEL: Record<Candidate['status'], string> = {
  declare: 'Déclaré·e',
  probable: 'Probable',
  hypothese: 'Hypothèse',
};

export const STATUS_HELP: Record<Candidate['status'], string> = {
  declare: 'A officiellement annoncé sa candidature',
  probable: 'A exprimé son intention sans déclaration formelle',
  hypothese: 'Candidature évoquée, non confirmée',
};

export const FAMILY_LABEL: Record<Candidate['family'], string> = {
  'extreme-gauche': 'Extrême gauche',
  gauche: 'Gauche',
  ecologiste: 'Écologiste',
  centre: 'Centre',
  droite: 'Droite',
  souverainiste: 'Souverainiste',
  'extreme-droite': 'Extrême droite',
};

export const POSITION_LABEL: Record<Candidate['position'], string> = {
  'extreme-gauche': 'Extrême gauche',
  'gauche-radicale': 'Gauche radicale',
  gauche: 'Gauche',
  'centre-gauche': 'Centre-gauche',
  centre: 'Centre',
  'centre-droit': 'Centre-droit',
  droite: 'Droite',
  'droite-souverainiste': 'Droite souverainiste',
  'extreme-droite': 'Extrême droite',
};

export const SOURCE_LABEL: Record<Measure['source_type'], string> = {
  officiel: 'Programme officiel',
  declaration: 'Déclaration',
  vote_ou_bilan: 'Vote ou bilan',
  analyse_tierce: 'Analyse tierce',
};

export const SOURCE_HELP: Record<Measure['source_type'], string> = {
  officiel: 'Programme, livret ou site officiel du candidat ou de son parti',
  declaration: 'Interview, discours ou tribune du candidat, rapporté par un média',
  vote_ou_bilan: 'Proposition de loi, vote au Parlement ou bilan de gestion',
  analyse_tierce: "Analyse d'un organisme tiers : ne provient pas du candidat",
};

export const PRECISION_LABEL: Record<Measure['precision'], string> = {
  chiffre: 'Chiffrée',
  precis: 'Précise',
  orientation_generale: 'Orientation générale',
};

export const PRECISION_HELP: Record<Measure['precision'], string> = {
  chiffre: 'Comporte un montant, un seuil ou une date',
  precis: 'Dispositif identifiable, sans chiffre',
  orientation_generale: 'Intention ou principe général',
};

export const FORMAT_LABEL: Record<Program['format'], string> = {
  page_web: 'Page web',
  pdf: 'PDF',
  livret: 'Livret',
  video: 'Vidéo',
  aucun: 'Aucun document',
};

export const PROGRAM_STATUS_LABEL: Record<Program['status'], string> = {
  publie: 'Publié',
  partiel: 'Partiel',
  en_cours_d_elaboration: "En cours d'élaboration",
};

export const VERIFICATION_LABEL = {
  webfetch: 'Page ouverte et vérifiée',
  search_result: 'Adresse confirmée par un moteur de recherche',
  check_links: 'Vérifiée par le contrôle automatique des liens',
} as const;
