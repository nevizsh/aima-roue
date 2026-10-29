import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode, Ref } from 'react';
import { Animated, StyleSheet, View, type ViewInstance } from 'react-native';
import { NB_LANCERS, nomsObjets, textes } from '../config/content';
import type { Segment } from '../config/segments';
import { couleurs, ombres, polices, rayons, tailles } from '../config/theme';
import type { Question, Recompense, Verdict } from '../domain/types';
import { useApparition } from '../hooks/useBoucle';
import { Bouton, Texte } from './base';
import { Gouttes } from './Compteur';
import { IllustrationObjet } from './Objets';

export const LARGEUR_CARTE = 800;

/** Carte en surface claire avec ombre douce (style app Aïma) ; entrée en glissement + fondu (instantanée en mouvement réduit). */
function Carte({
  children,
  cle,
  reduit,
  refCarte,
  label,
}: {
  children: ReactNode;
  cle: unknown;
  reduit: boolean;
  refCarte?: Ref<ViewInstance>;
  label?: string;
}) {
  const a = useApparition(cle, reduit);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [36, 0] });
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateY }] }}>
      <View style={styles.carte} ref={refCarte} tabIndex={refCarte ? -1 : undefined} accessibilityLabel={label}>
        {children}
      </View>
    </Animated.View>
  );
}

/** Pastille de thème : disque de la couleur du segment + icône sur crème (jamais la couleur seule). */
function Pastille({ segment, taille }: { segment: Segment; taille: number }) {
  return (
    <View style={[styles.pastille, { width: taille, height: taille, backgroundColor: segment.couleur }]}>
      <View style={[styles.pastilleInterieur, { width: taille * 0.74, height: taille * 0.74 }]}>
        <Ionicons name={segment.icone} size={taille * 0.42} color={couleurs.aubergine} />
      </View>
    </View>
  );
}

function Badge({ segment }: { segment: Segment }) {
  return (
    <View style={styles.badge}>
      <Pastille segment={segment} taille={60} />
      <Texte style={styles.themePetit}>{segment.libelle}</Texte>
    </View>
  );
}

function BoutonPrincipal({
  libelle,
  icone = 'arrow-forward',
  onPress,
  refBouton,
  disabled,
}: {
  libelle: string;
  icone?: 'arrow-forward' | 'gift' | 'refresh' | 'sync';
  onPress: () => void;
  refBouton?: Ref<ViewInstance>;
  disabled?: boolean;
}) {
  return (
    <Bouton ref={refBouton} onPress={onPress} disabled={disabled} style={styles.boutonPrincipal}>
      <Texte style={styles.texteBoutonPrincipal}>{libelle}</Texte>
      <Ionicons name={icone} size={34} color={couleurs.creme} />
    </Bouton>
  );
}

/* ---------- Accueil ---------- */

export function CarteAccueil({
  pret,
  onCommencer,
  refBouton,
  reduit,
}: {
  pret: boolean;
  onCommencer: () => void;
  refBouton: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle="accueil" reduit={reduit}>
      <Texte style={styles.titre} role="heading" aria-level={1}>
        {textes.titre}
      </Texte>
      <Texte style={styles.sousTitre}>{textes.sousTitre}</Texte>
      <BoutonPrincipal
        libelle={pret ? textes.boutonCommencer : textes.chargement}
        icone="sync"
        onPress={onCommencer}
        refBouton={refBouton}
        disabled={!pret}
      />
      <Texte style={styles.aide}>{textes.aideClavier}</Texte>
    </Carte>
  );
}

/* ---------- Rotation et thème ---------- */

export function CarteRotation({ reduit }: { reduit: boolean }) {
  return (
    <Carte cle="rotation" reduit={reduit}>
      <Ionicons name="sync" size={72} color={couleurs.aubergine} />
      <Texte style={styles.themeGrand}>{textes.rotationEnCours}</Texte>
    </Carte>
  );
}

export function CarteTheme({ segment, reduit }: { segment: Segment; reduit: boolean }) {
  return (
    <Carte cle={`theme-${segment.id}`} reduit={reduit}>
      <Texte style={styles.surtitre}>{textes.themeTire}</Texte>
      <Pastille segment={segment} taille={200} />
      <Texte style={styles.themeGrand}>{segment.libelle}</Texte>
    </Carte>
  );
}

export function ChoixJoker({
  joker,
  themes,
  onChoisir,
  refPremier,
  reduit,
}: {
  joker: Segment;
  themes: Segment[];
  onChoisir: (id: string) => void;
  refPremier: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle="joker" reduit={reduit}>
      <Badge segment={joker} />
      <Texte style={styles.consigne}>{textes.jokerConsigne}</Texte>
      <View style={styles.liste}>
        {themes.map((s, i) => (
          <Bouton
            key={s.id}
            ref={i === 0 ? refPremier : undefined}
            accessibilityLabel={`${i + 1}. ${s.libelle}`}
            onPress={() => onChoisir(s.id)}
            style={[styles.choix, styles.choixCompact]}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Pastille segment={s} taille={48} />
            <Texte style={styles.texteChoix}>{s.libelle}</Texte>
          </Bouton>
        ))}
      </View>
    </Carte>
  );
}

/* ---------- Question et verdict ---------- */

export function CarteQuestion({
  question,
  segment,
  onRepondre,
  refCarte,
  reduit,
}: {
  question: Question;
  segment: Segment;
  onRepondre: (index: number) => void;
  refCarte: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle={question.id} reduit={reduit} refCarte={refCarte} label={`${segment.libelle}. ${question.question}`}>
      <Badge segment={segment} />
      <Texte style={styles.question} role="heading" aria-level={2}>
        {question.question}
      </Texte>
      <Texte style={styles.consigne}>{textes.consigneReponse}</Texte>
      <View style={styles.liste}>
        {question.reponses.map((r, i) => (
          <Bouton
            key={r.texte}
            accessibilityLabel={`${i + 1}. ${r.texte}`}
            onPress={() => onRepondre(i)}
            style={styles.choix}
          >
            <Texte style={styles.numero}>{i + 1}</Texte>
            <Texte style={styles.texteChoix}>{r.texte}</Texte>
          </Bouton>
        ))}
      </View>
    </Carte>
  );
}

export function CarteReponse({
  question,
  verdict,
  lancer,
  onSuivant,
  refSuivant,
  reduit,
}: {
  question: Question;
  verdict: Verdict;
  lancer: number;
  onSuivant: () => void;
  refSuivant: Ref<ViewInstance>;
  reduit: boolean;
}) {
  const bonne = verdict === 'bonne';
  const correcte = question.reponses.find((r) => r.correcte);
  const dernier = lancer >= NB_LANCERS;
  return (
    <Carte cle={`${question.id}-reponse`} reduit={reduit}>
      <View style={styles.badge}>
        <Ionicons name={bonne ? 'sparkles' : 'bulb'} size={64} color={couleurs.aubergine} />
        <Texte style={styles.verdict}>{bonne ? textes.verdictBonneTitre : textes.verdictPresqueTitre}</Texte>
      </View>
      <Texte style={styles.message}>{bonne ? textes.verdictBonneMessage : textes.verdictPresqueMessage}</Texte>

      <View style={[styles.choix, styles.choixCorrect]}>
        <Ionicons name="checkmark-circle" size={44} color={couleurs.creme} />
        <View style={styles.colonneChoix}>
          <Texte style={[styles.etiquette, styles.texteCreme]}>{textes.etiquetteBonneReponse}</Texte>
          <Texte style={[styles.texteChoix, styles.texteCreme]}>{correcte?.texte}</Texte>
        </View>
      </View>

      <View style={styles.explication}>
        <Ionicons name="information-circle" size={40} color={couleurs.petrole} />
        <Texte style={styles.texteExplication}>{question.explication}</Texte>
      </View>

      <BoutonPrincipal
        libelle={dernier ? textes.voirRecompenses : textes.lancerSuivant(lancer + 1)}
        icone={dernier ? 'gift' : 'sync'}
        onPress={onSuivant}
        refBouton={refSuivant}
      />
    </Carte>
  );
}

/* ---------- Résultat ---------- */

export function CarteResultat({
  bonnes,
  resultats,
  recompense,
  onSuivant,
  refSuivant,
  reduit,
}: {
  bonnes: number;
  resultats: Verdict[];
  recompense: Recompense;
  onSuivant: () => void;
  refSuivant: Ref<ViewInstance>;
  reduit: boolean;
}) {
  return (
    <Carte cle="resultat" reduit={reduit}>
      <View style={styles.badge}>
        <Texte style={styles.score} accessibilityLabel={textes.scoreAccessible(bonnes)}>
          {textes.score(bonnes)}
        </Texte>
        <Gouttes resultats={resultats} lancer={NB_LANCERS} taille={72} />
      </View>
      <Texte style={styles.messagePalier} role="heading" aria-level={2}>
        {recompense.message}
      </Texte>
      <Texte style={styles.surtitre}>{textes.tuReparsAvec}</Texte>
      <View style={styles.objets}>
        {recompense.objets.map((o, i) => (
          <ObjetColle key={o} index={i} reduit={reduit}>
            <IllustrationObjet id={o} taille={130} />
            <Texte style={styles.nomObjet}>{nomsObjets[o]}</Texte>
          </ObjetColle>
        ))}
      </View>
      <BoutonPrincipal libelle={textes.boutonJoueurSuivant} icone="refresh" onPress={onSuivant} refBouton={refSuivant} />
    </Carte>
  );
}

/** Carte d'objet qui « se colle » : légère rotation + rebond, décalée de 200 ms par objet. */
function ObjetColle({ children, index, reduit }: { children: ReactNode; index: number; reduit: boolean }) {
  const a = useApparition(`objet-${index}`, reduit, 200 * index + 250);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1.5, 1] });
  const penche = index % 2 === 0 ? -4 : 4;
  const rotate = a.interpolate({ inputRange: [0, 1], outputRange: [`${penche * 4}deg`, `${penche}deg`] });
  const opacity = a.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' });
  return (
    <Animated.View style={[styles.objet, { opacity, transform: reduit ? [] : [{ scale }, { rotate }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  carte: {
    ...ombres.modale,
    width: LARGEUR_CARTE,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.lg,
    // Focus programmatique pour les lecteurs d'écran : la carte n'est pas actionnable, pas d'anneau.
    outlineColor: 'transparent',
    paddingHorizontal: 44,
    paddingVertical: 30,
    gap: 18,
    alignItems: 'center',
  },
  titre: { fontFamily: polices.titre, fontSize: 64, lineHeight: 112, textAlign: 'center' },
  sousTitre: { fontFamily: polices.extraGras, fontSize: 40, textAlign: 'center' },
  aide: { fontFamily: polices.texte, fontSize: 24, color: couleurs.aubergineDouce },
  pastille: { borderRadius: rayons.plein, alignItems: 'center', justifyContent: 'center' },
  pastilleInterieur: {
    borderRadius: rayons.plein,
    backgroundColor: couleurs.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  surtitre: { fontFamily: polices.gras, fontSize: 34, color: couleurs.aubergineDouce },
  themeGrand: { fontFamily: polices.extraGras, fontSize: 56, textAlign: 'center' },
  themePetit: { fontFamily: polices.extraGras, fontSize: 30 },
  consigne: { fontFamily: polices.texte, fontSize: 26, color: couleurs.aubergineDouce },
  question: { fontFamily: polices.extraGras, fontSize: tailles.question, textAlign: 'center', lineHeight: 50 },
  liste: { width: '100%', gap: 12 },
  choix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 18,
    minHeight: 76,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: rayons.lg,
    borderWidth: 2,
    borderColor: couleurs.aubergineDouce,
    backgroundColor: couleurs.surface,
  },
  choixCompact: { minHeight: 64 },
  choixCorrect: { backgroundColor: couleurs.petrole, borderColor: couleurs.petrole },
  colonneChoix: { flexShrink: 1 },
  numero: {
    fontFamily: polices.extraGras,
    fontSize: 28,
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
    borderRadius: 25,
    backgroundColor: couleurs.lime,
    color: couleurs.aubergine,
    overflow: 'hidden',
  },
  texteChoix: { fontFamily: polices.gras, fontSize: 30, flexShrink: 1 },
  texteCreme: { color: couleurs.creme },
  etiquette: { fontFamily: polices.extraGras, fontSize: tailles.libelle },
  verdict: { fontFamily: polices.extraGras, fontSize: tailles.verdict },
  message: { fontFamily: polices.gras, fontSize: 30, textAlign: 'center', color: couleurs.aubergineDouce },
  explication: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: couleurs.petroleClair,
    borderRadius: rayons.md,
    padding: 18,
    width: '100%',
  },
  texteExplication: { fontFamily: polices.texte, fontSize: 28, lineHeight: 38, flexShrink: 1 },
  boutonPrincipal: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: couleurs.aubergine,
    borderRadius: rayons.plein,
    paddingHorizontal: 44,
    paddingVertical: 16,
    minHeight: 72,
  },
  texteBoutonPrincipal: { fontFamily: polices.extraGras, fontSize: 32, color: couleurs.creme },
  score: { fontFamily: polices.extraGras, fontSize: 88, lineHeight: 100 },
  messagePalier: { fontFamily: polices.extraGras, fontSize: 36, textAlign: 'center', lineHeight: 46 },
  objets: { flexDirection: 'row', gap: 28, justifyContent: 'center' },
  objet: {
    alignItems: 'center',
    gap: 4,
    width: 210,
    paddingVertical: 12,
    backgroundColor: couleurs.creme,
    borderRadius: rayons.lg,
  },
  nomObjet: { fontFamily: polices.extraGras, fontSize: 30 },
});
