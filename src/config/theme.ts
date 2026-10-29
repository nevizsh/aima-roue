/** Palette Aïma (aplats uniquement, pas de dégradés), alignée sur la Palette de l'app Aïma. */
export const couleurs = {
  /** Fond de page (neutre 50). */
  creme: '#F6F1E4',
  /** Surface des cartes et boutons flottants (neutre 0). */
  surface: '#FFFDF7',
  /** Décor rose et fond doux (corail 100). */
  rose: '#FFE8E4',
  aubergine: '#3E2430',
  /** Texte secondaire, contours discrets (aubergine 500). */
  aubergineDouce: '#6A5560',
  /** Pointillés décoratifs (aubergine 300). */
  aubergineClaire: '#8A7A82',
  lime: '#C6DA2C',
  petrole: '#136B7A',
  /** Fond des encarts d'information (petrole 100). */
  petroleClair: '#E4F3F5',
  orange: '#F0A03C',
  mousse: '#6E9B3E',
  corail: '#F07A5E',
  /** Rouge de marque (corail 700). */
  corailFonce: '#A83B24',
  /* Déclinaisons en aplat (reflets = formes plus claires). */
  laitonClair: '#F8C978',
  laitonFonce: '#C77A1F',
  ampouleEteinte: '#EBCB93',
  corailClair: '#F6A38E',
  limeClair: '#E2EC8F',
} as const;

/**
 * Rayons et ombres de l'app Aïma, doublés pour la scène 1920×1080
 * (l'app est pensée pour un téléphone, la scène est lue à 2 m).
 */
export const rayons = { md: 24, lg: 32, plein: 999 } as const;

export const ombres = {
  flottante: { boxShadow: '0px 12px 32px rgba(62, 36, 48, 0.16)' },
  modale: { boxShadow: '0px 24px 64px rgba(62, 36, 48, 0.22)' },
} as const;

/** Polices embarquées (chargées dans App.tsx). Pacifico : un seul grand titre. */
export const polices = {
  texte: 'NunitoSans_400Regular',
  gras: 'NunitoSans_700Bold',
  extraGras: 'NunitoSans_800ExtraBold',
  titre: 'Pacifico_400Regular',
} as const;

/** Tailles en px sur la scène 1920×1080 (lisibilité à 2 m). */
export const tailles = {
  libelle: 24,
  texte: 28,
  question: 40,
  verdict: 64,
  titre: 88,
  cibleMin: 48,
} as const;

export const durees = {
  /** Prise d'élan : recul de 10° en 250 ms. */
  elan: 250,
  elanDegres: 10,
  /** Tours puis décélération (ease-out quint) : ~5 s au total avec l'élan. */
  rotation: 4750,
  toursMin: 4,
  toursMax: 6,
  /** Mouvement réduit : 1 tour en 1 s, sans élan. */
  rotationReduite: 1000,
  /** Un tour complet au repos (accueil), très lent. */
  tourRepos: 90000,
  revelationTheme: 1500,
} as const;

/** Anneau de focus : liseré crème + double anneau aubergine 3 px (web). */
export const anneauFocus = {
  boxShadow: `0 0 0 2px ${couleurs.creme}, 0 0 0 5px ${couleurs.aubergine}, 0 0 0 7px ${couleurs.creme}, 0 0 0 10px ${couleurs.aubergine}`,
} as const;

export interface PaireContraste {
  avantPlan: string;
  fond: string;
  usage: string;
  /** texte : seuil 4,5:1 ; graphique (icônes, anneaux) : seuil 3:1. */
  type: 'texte' | 'graphique';
}

/** Toutes les paires avant-plan / fond utilisées dans l'interface (testées). */
export const pairesContraste: PaireContraste[] = [
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'texte courant, objets de la carte résultat', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.surface, usage: 'cartes, compteur, échelle, cartouches des segments, bouton son', type: 'texte' },
  { avantPlan: couleurs.aubergineDouce, fond: couleurs.surface, usage: 'texte secondaire (consignes, aide, noms des objets)', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.petroleClair, usage: 'explication dans l’encart info', type: 'texte' },
  { avantPlan: couleurs.aubergineDouce, fond: couleurs.creme, usage: 'titre « Tes récompenses » sur le fond crème', type: 'texte' },
  { avantPlan: couleurs.aubergineDouce, fond: couleurs.rose, usage: 'titre « Tes récompenses » sur une forme rose', type: 'texte' },
  { avantPlan: couleurs.creme, fond: couleurs.aubergine, usage: 'boutons, bouton Lance !, plaque du socle', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'numéros de réponse, palier atteint, goutte du lancer en cours', type: 'texte' },
  { avantPlan: couleurs.creme, fond: couleurs.petrole, usage: 'bonne réponse surlignée', type: 'texte' },
  { avantPlan: couleurs.aubergine, fond: couleurs.surface, usage: 'icônes de segment, icône du bouton son', type: 'graphique' },
  { avantPlan: couleurs.aubergineDouce, fond: couleurs.surface, usage: 'contour des réponses, gouttes à venir en pointillés', type: 'graphique' },
  { avantPlan: couleurs.petrole, fond: couleurs.petroleClair, usage: 'icône de l’encart info', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.rose, usage: 'ampoule de la goutte « presque »', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'étoile du palier atteint', type: 'graphique' },
  { avantPlan: couleurs.creme, fond: couleurs.petrole, usage: 'coche de la goutte « bonne réponse »', type: 'graphique' },
  { avantPlan: couleurs.lime, fond: couleurs.aubergine, usage: 'gouttes du Joker, anneau du bouton central, perles allumées de la jante', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'jante de la roue sur le fond crème', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.rose, usage: 'jante de la roue sur le disque rose', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'séparateur de segment sur le segment lime', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.orange, usage: 'séparateur de segment sur le segment orange', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.corail, usage: 'séparateur de segment sur le segment corail', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.mousse, usage: 'séparateur de segment sur le segment mousse', type: 'graphique' },
  { avantPlan: couleurs.surface, fond: couleurs.aubergine, usage: 'liseré du pointeur sur la jante', type: 'graphique' },
  { avantPlan: couleurs.surface, fond: couleurs.petrole, usage: 'liseré du pointeur sur le segment pétrole', type: 'graphique' },
  { avantPlan: couleurs.creme, fond: couleurs.aubergine, usage: 'liseré de focus sur bouton aubergine', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.creme, usage: 'anneau de focus sur fond crème', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.surface, usage: 'anneau de focus sur réponse', type: 'graphique' },
  { avantPlan: couleurs.aubergine, fond: couleurs.lime, usage: 'anneau de focus sur palier lime', type: 'graphique' },
];
