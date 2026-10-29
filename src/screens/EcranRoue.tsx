import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance } from 'react-native';
import { Annonce, Bouton, Scene, Texte } from '../components/base';
import {
  CarteAccueil,
  CarteQuestion,
  CarteReponse,
  CarteResultat,
  CarteRotation,
  CarteTheme,
  ChoixJoker,
  LARGEUR_CARTE,
} from '../components/Cartes';
import { Compteur } from '../components/Compteur';
import { Confettis } from '../components/decor/Confettis';
import { CENTRE_ROUE, Fond, Pastilles } from '../components/decor/Fond';
import { Echelle } from '../components/Echelle';
import { type ModeAmpoules, RAYON_JANTE, Roue } from '../components/Roue';
import { LARGEUR_SOCLE, Socle } from '../components/Socle';
import { NB_LANCERS, nomsObjets, textes } from '../config/content';
import { estJoker, type Segment } from '../config/segments';
import { couleurs, durees, ombres, polices, rayons } from '../config/theme';
import type { QuestionsAdapter } from '../data/QuestionsAdapter';
import type { ObjetEpuisable, Rng, ThemeId } from '../domain/types';
import { useClavier } from '../hooks/useClavier';
import { useMouvementReduit } from '../hooks/useMouvementReduit';
import { useContenu } from '../hooks/useQuestions';
import { useSon } from '../hooks/useSon';
import { entierAleatoire, rngCrypto } from '../logic/aleatoire';
import { angleArret, largeurSegment } from '../logic/angle';
import { choisirQuestion, ordonnerReponses } from '../logic/questions';
import { lireEpuises, palierPour, recompense } from '../logic/recompense';
import { type Etat, etatInitial, nbBonnes, peutLancer, reducteur } from '../logic/reducteur';
import { tirerSegment } from '../logic/tirage';
import { chargerHistorique, chargerSon, sauverHistorique, sauverSon } from '../storage/stockageLocal';

interface Props {
  adapter: QuestionsAdapter;
  rng?: Rng;
}

function lireEpuisesUrl(): ObjetEpuisable[] {
  return typeof window !== 'undefined' && window.location ? lireEpuises(window.location.search) : [];
}

const listeObjets = (epuises: readonly ObjetEpuisable[], bonnes: number) =>
  recompense(bonnes, epuises)
    .objets.map((o) => nomsObjets[o])
    .join(', ');

/** Message pour les lecteurs d'écran : compteur, thème tiré, verdict, récompenses. */
function messageAnnonce(etat: Etat, segments: Segment[], epuises: readonly ObjetEpuisable[]): string {
  const bonnes = nbBonnes(etat);
  const compteur = textes.annonceCompteur(etat.lancer, bonnes);
  switch (etat.phase) {
    case 'rotation':
      return `${compteur} ${textes.rotationEnCours}`;
    case 'theme': {
      const s = segments[etat.segmentIndex];
      return estJoker(s.id) ? textes.annonceJoker : textes.annonceTheme(s.libelle);
    }
    case 'choixJoker':
      return textes.annonceJoker;
    case 'reponse': {
      const bonne = etat.verdict === 'bonne';
      const titre = bonne ? textes.verdictBonneTitre : textes.verdictPresqueTitre;
      const correcte = etat.question.reponses.find((r) => r.correcte)?.texte ?? '';
      return `${titre} ${textes.etiquetteBonneReponse} : ${correcte}. ${etat.question.explication} ${compteur}`;
    }
    case 'resultat': {
      const r = recompense(bonnes, epuises);
      return `${textes.scoreAccessible(bonnes)}. ${r.message} ${textes.annonceRecompenses(listeObjets(epuises, bonnes))}`;
    }
    default:
      return '';
  }
}

function modeAmpoules(etat: Etat): ModeAmpoules {
  if (etat.phase === 'rotation') return 'rotation';
  if (etat.phase === 'resultat') return 'fete';
  return 'attente';
}

export function EcranRoue({ adapter, rng = rngCrypto }: Props) {
  const [etat, dispatch] = useReducer(reducteur, etatInitial);
  const contenu = useContenu(adapter);
  const segments = useMemo(() => contenu?.segments ?? [], [contenu]);
  const reduit = useMouvementReduit();
  const [epuises] = useState(lireEpuisesUrl);
  const [historiqueCharge, setHistoriqueCharge] = useState(false);
  const pret = contenu !== null && segments.length > 1 && historiqueCharge;

  const [rotation] = useState(() => new Animated.Value(0));
  const [oscillation] = useState(() => new Animated.Value(0));
  const [son, setSon] = useState(true);
  const sons = useSon(son);

  const refCommencer = useRef<ViewInstance>(null);
  const refCarteQuestion = useRef<ViewInstance>(null);
  const refSuivant = useRef<ViewInstance>(null);
  const refJoker = useRef<ViewInstance>(null);

  /* ---------- Persistance locale (historique des questions, préférence de son) ---------- */

  useEffect(() => {
    let actif = true;
    void chargerHistorique().then((historique) => {
      if (!actif) return;
      dispatch({ type: 'HISTORIQUE_CHARGE', historique });
      setHistoriqueCharge(true);
    });
    void chargerSon().then((v) => actif && setSon(v));
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    if (historiqueCharge) void sauverHistorique(etat.historique);
  }, [etat.historique, historiqueCharge]);

  const basculerSon = useCallback(() => {
    setSon((s) => {
      void sauverSon(!s);
      return !s;
    });
  }, []);

  /* ---------- Actions ---------- */

  const lancer = useCallback(() => {
    if (!pret || !peutLancer(etat)) return;
    // La roue tourne peut-être lentement (accueil) : on part de sa position réelle.
    rotation.stopAnimation((depart) => {
      // Le résultat est tiré AVANT l'animation.
      const segmentIndex = tirerSegment(segments.length, rng);
      const tours = reduit ? 1 : durees.toursMin + entierAleatoire(durees.toursMax - durees.toursMin + 1, rng);
      const angle = angleArret({ index: segmentIndex, nbSegments: segments.length, angleCourant: depart, tours, rng });
      dispatch({ type: 'LANCER', segmentIndex, angle });
    });
  }, [pret, etat, rotation, segments.length, reduit, rng]);

  const tirerQuestion = useCallback(
    (themeId: ThemeId) => {
      const t = choisirQuestion(contenu?.questions[themeId] ?? [], etat.historique[themeId] ?? [], etat.poseesPartie, rng);
      return t && { ...t, question: ordonnerReponses(t.question, rng) };
    },
    [contenu, etat.historique, etat.poseesPartie, rng],
  );

  const themes = useMemo(() => segments.filter((s) => !estJoker(s.id)), [segments]);

  const choisirTheme = useCallback(
    (themeId: ThemeId) => {
      const tirage = tirerQuestion(themeId);
      if (tirage) dispatch({ type: 'CHOISIR_THEME', themeId, tirage });
    },
    [tirerQuestion],
  );

  const repondre = useCallback((index: number) => dispatch({ type: 'REPONDRE', index }), []);

  const apresVerdict = useCallback(() => {
    if (etat.lancer >= NB_LANCERS) dispatch({ type: 'VOIR_RESULTAT' });
    else lancer();
  }, [etat.lancer, lancer]);

  const joueurSuivant = useCallback(() => dispatch({ type: 'JOUEUR_SUIVANT' }), []);

  useClavier({
    principal: () => {
      if (etat.phase === 'accueil') lancer();
      else if (etat.phase === 'reponse') apresVerdict();
      else if (etat.phase === 'resultat') joueurSuivant();
    },
    basculerSon,
    chiffre: (n) => {
      if (etat.phase === 'question') repondre(n - 1);
      if (etat.phase === 'choixJoker') {
        const choix = themes[n - 1];
        if (choix) choisirTheme(choix.id);
      }
    },
  });

  /* ---------- Rotation lente au repos (accueil) ---------- */

  const enAccueil = etat.phase === 'accueil';
  useEffect(() => {
    if (!enAccueil || reduit) return;
    let actif = true;
    const boucle = () => {
      rotation.stopAnimation((v) => {
        if (!actif) return;
        Animated.timing(rotation, {
          toValue: v + 360,
          duration: durees.tourRepos,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(({ finished }) => finished && actif && boucle());
      });
    };
    boucle();
    return () => {
      actif = false;
    };
  }, [enAccueil, reduit, rotation]);

  /* ---------- Effets de transition (une seule fois par nouvel état) ---------- */

  const dernierEtat = useRef<Etat | null>(null);

  useEffect(() => {
    if (dernierEtat.current === etat) return;
    const precedent = dernierEtat.current;
    dernierEtat.current = etat;
    if (precedent?.phase === etat.phase && etat.phase === 'accueil') return;

    switch (etat.phase) {
      case 'accueil':
        if (precedent) refCommencer.current?.focus();
        return;

      case 'rotation': {
        // Un « tic » et une pichenette du pointeur à chaque segment qui passe.
        const L = largeurSegment(segments.length);
        let depart = 0;
        rotation.stopAnimation((v) => (depart = v));
        let secteur = Math.floor(depart / L);
        const ecoute = rotation.addListener(({ value }) => {
          const s = Math.floor(value / L);
          if (s === secteur) return;
          secteur = s;
          sons.tic();
          if (!reduit) {
            oscillation.setValue(-14);
            Animated.spring(oscillation, { toValue: 0, friction: 4, tension: 140, useNativeDriver: false }).start();
          }
        });
        const elan = Animated.timing(rotation, {
          toValue: depart - durees.elanDegres,
          duration: durees.elan,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        });
        const tour = Animated.timing(rotation, {
          toValue: etat.angle,
          duration: reduit ? durees.rotationReduite : durees.rotation,
          easing: reduit ? Easing.out(Easing.quad) : Easing.out(Easing.poly(5)),
          useNativeDriver: false,
        });
        (reduit ? tour : Animated.sequence([elan, tour])).start(({ finished }) => {
          rotation.removeListener(ecoute);
          oscillation.setValue(0);
          if (finished) dispatch({ type: 'ROTATION_TERMINEE' });
        });
        return;
      }

      case 'theme': {
        sons.pop();
        const id = segments[etat.segmentIndex].id;
        // Pas d'annulation : aucune action ne peut quitter la phase « theme » avant ce minuteur.
        setTimeout(() => {
          if (estJoker(id)) {
            dispatch({ type: 'THEME_REVELE', joker: true });
            return;
          }
          const tirage = tirerQuestion(id);
          // Thème sans question disponible : on laisse choisir un autre thème plutôt que de bloquer.
          if (tirage) dispatch({ type: 'THEME_REVELE', joker: false, themeId: id, tirage });
          else dispatch({ type: 'THEME_REVELE', joker: true });
        }, durees.revelationTheme);
        return;
      }

      case 'choixJoker':
        refJoker.current?.focus();
        return;

      case 'question':
        refCarteQuestion.current?.focus();
        return;

      case 'reponse':
        if (etat.verdict === 'bonne') sons.fanfare();
        else sons.carillon();
        refSuivant.current?.focus();
        return;

      case 'resultat':
        sons.fanfare();
        refSuivant.current?.focus();
        return;
    }
    // L'effet ne rejoue rien pour un même état (garde dernierEtat) : les autres dépendances
    // servent seulement à disposer de leurs valeurs à jour.
  }, [etat, reduit, rotation, oscillation, sons, tirerQuestion, segments]);

  /* ---------- Rendu ---------- */

  const bonnes = nbBonnes(etat);
  const atteint = etat.lancer > 0 ? palierPour(bonnes) : null;
  const fete = etat.phase === 'resultat' && bonnes >= 2 && !reduit;

  return (
    <Scene>
      <Fond />

      <View style={styles.socle} pointerEvents="none">
        <Socle />
      </View>

      <View style={styles.roue}>
        {segments.length > 0 && (
          <Roue
            segments={segments}
            rotation={rotation}
            oscillationPointeur={oscillation}
            modeAmpoules={modeAmpoules(etat)}
            reduit={reduit}
            boutonActif={pret && peutLancer(etat)}
            onLancer={etat.phase === 'reponse' ? apresVerdict : lancer}
          />
        )}
      </View>

      <Pastilles reduit={reduit} />

      <View style={styles.colonne}>
        <View style={styles.haut}>
          <Compteur lancer={etat.lancer} resultats={etat.resultats} />
        </View>

        <View style={styles.centreColonne}>
          {etat.phase === 'accueil' && (
            <CarteAccueil pret={pret} onCommencer={lancer} refBouton={refCommencer} reduit={reduit} />
          )}
          {etat.phase === 'rotation' && <CarteRotation reduit={reduit} />}
          {etat.phase === 'theme' && <CarteTheme segment={segments[etat.segmentIndex]} reduit={reduit} />}
          {etat.phase === 'choixJoker' && (
            <ChoixJoker
              joker={segments[etat.segmentIndex]}
              themes={themes}
              onChoisir={choisirTheme}
              refPremier={refJoker}
              reduit={reduit}
            />
          )}
          {etat.phase === 'question' && (
            <CarteQuestion
              question={etat.question}
              segment={segments.find((s) => s.id === etat.themeId) ?? segments[etat.segmentIndex]}
              onRepondre={repondre}
              refCarte={refCarteQuestion}
              reduit={reduit}
            />
          )}
          {etat.phase === 'reponse' && (
            <CarteReponse
              question={etat.question}
              verdict={etat.verdict}
              lancer={etat.lancer}
              onSuivant={apresVerdict}
              refSuivant={refSuivant}
              reduit={reduit}
            />
          )}
          {etat.phase === 'resultat' && (
            <CarteResultat
              bonnes={bonnes}
              resultats={etat.resultats}
              recompense={recompense(bonnes, epuises)}
              onSuivant={joueurSuivant}
              refSuivant={refSuivant}
              reduit={reduit}
            />
          )}
        </View>

        <Echelle epuises={epuises} atteint={atteint} />
      </View>

      {/* Bouton son, en haut à droite */}
      <Bouton onPress={basculerSon} accessibilityLabel={son ? textes.sonActive : textes.sonCoupe} style={styles.son}>
        <Ionicons name={son ? 'volume-high' : 'volume-mute'} size={28} color={couleurs.aubergine} />
        <Texte style={styles.texteSon}>{son ? textes.sonActive : textes.sonCoupe}</Texte>
      </Bouton>

      <Confettis actif={fete} />
      <Annonce message={pret ? messageAnnonce(etat, segments, epuises) : ''} />
    </Scene>
  );
}

const styles = StyleSheet.create({
  socle: {
    position: 'absolute',
    left: CENTRE_ROUE.x - LARGEUR_SOCLE / 2,
    // Plaque posée juste sous la jante.
    top: CENTRE_ROUE.y + RAYON_JANTE + 8,
  },
  roue: {
    position: 'absolute',
    left: CENTRE_ROUE.x - RAYON_JANTE,
    top: CENTRE_ROUE.y - RAYON_JANTE,
  },
  colonne: {
    position: 'absolute',
    left: 1060,
    top: 24,
    width: LARGEUR_CARTE + 14,
    height: 1080 - 48,
    justifyContent: 'space-between',
    gap: 16,
  },
  haut: { flexDirection: 'row', alignItems: 'center', minHeight: 84 },
  centreColonne: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  son: {
    position: 'absolute',
    right: 24,
    top: 24,
    flexDirection: 'row',
    gap: 10,
    ...ombres.flottante,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.plein,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  texteSon: { fontFamily: polices.extraGras, fontSize: 24 },
});
