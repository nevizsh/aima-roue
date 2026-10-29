import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type Ref, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewInstance, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { textes } from '../config/content';
import type { Segment } from '../config/segments';
import { couleurs, ombres, polices, rayons, tailles } from '../config/theme';
import { useBoucle } from '../hooks/useBoucle';
import { centreSegment, largeurSegment } from '../logic/angle';
import { Bouton, Texte } from './base';
import { cheminGoutte } from './decor/formes';

/** Rayon de l'emprise de la roue : elle occupe un carré de 2 × RAYON_JANTE (pointeur compris). */
export const RAYON_JANTE = 390;
const D = RAYON_JANTE * 2;
const C = RAYON_JANTE;
const R_DISQUE = 344;
/** Jante : simple anneau aubergine autour du disque. */
const EPAISSEUR_JANTE = 24;
const R_EXTERIEUR = R_DISQUE + EPAISSEUR_JANTE;
const R_AMPOULES = R_DISQUE + EPAISSEUR_JANTE / 2;
const NB_AMPOULES = 24;

const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (c: number, r: number, deg: number) => `${c + r * Math.sin(rad(deg))} ${c - r * Math.cos(rad(deg))}`;

/** Secteur circulaire, angles en degrés horaires depuis le haut. */
function secteur(c: number, r: number, debut: number, fin: number): string {
  return `M ${c} ${c} L ${point(c, r, debut)} A ${r} ${r} 0 0 1 ${point(c, r, fin)} Z`;
}

export type ModeAmpoules = 'attente' | 'rotation' | 'fete';

interface Props {
  segments: Segment[];
  rotation: Animated.Value;
  /** Petite oscillation du pointeur à chaque segment (degrés). */
  oscillationPointeur: Animated.Value;
  modeAmpoules: ModeAmpoules;
  reduit: boolean;
  boutonActif: boolean;
  onLancer: () => void;
  refBouton?: Ref<ViewInstance>;
}

export function Roue({ segments, rotation, oscillationPointeur, modeAmpoules, reduit, boutonActif, onLancer, refBouton }: Props) {
  const rotate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const pas = useChenillard(modeAmpoules, reduit);
  const pulsation = useBoucle(boutonActif && !reduit, 1400, Easing.inOut(Easing.sin));
  const scale = pulsation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });
  const inclinaison = oscillationPointeur.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] });

  return (
    <View style={{ width: D, height: D }}>
      <Jante />
      <Svg width={D} height={D} style={StyleSheet.absoluteFill} aria-hidden>
        <Ampoules pas={pas} mode={modeAmpoules} reduit={reduit} />
      </Svg>

      {/* Disque des segments : dessiné une seule fois, seule la vue qui l'enveloppe tourne */}
      <Animated.View style={[styles.disque, COMPOSITEUR, { transform: [{ rotate }] }]} aria-hidden>
        <Disque segments={segments} />
      </Animated.View>

      {/* Pointeur goutte en haut de la jante, pointe vers le segment tiré */}
      <Animated.View style={[styles.pointeur, { transform: [{ rotate: inclinaison }] }]} pointerEvents="none" aria-hidden>
        <Pointeur />
      </Animated.View>

      {/* Bouton central */}
      <View style={styles.centre} pointerEvents="box-none">
        <Animated.View style={[styles.anneauCreme, { transform: [{ scale }] }]}>
          <Bouton
            ref={refBouton}
            onPress={onLancer}
            disabled={!boutonActif}
            accessibilityLabel={textes.boutonLancerAccessible}
            accessibilityState={{ disabled: !boutonActif }}
            style={styles.bouton}
          >
            <Texte style={styles.texteBouton}>{textes.boutonLancer}</Texte>
          </Bouton>
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * Jante sobre : un anneau aubergine en aplat. Il détache la roue du fond crème (12:1),
 * là où l'ancienne jante orange se fondait dedans (1,9:1).
 */
const Jante = memo(function Jante() {
  return (
    <Svg width={D} height={D} style={StyleSheet.absoluteFill} aria-hidden>
      <Circle cx={C} cy={C} r={R_EXTERIEUR} fill={couleurs.aubergine} />
    </Svg>
  );
});

/** SVG du disque, mémoïsé : aucun re-render pendant la rotation. */
const Disque = memo(function Disque({ segments }: { segments: Segment[] }) {
  const L = largeurSegment(segments.length);
  return (
    <>
      <Svg width={R_DISQUE * 2} height={R_DISQUE * 2}>
        {segments.map((s, i) => (
          <Path
            key={s.id}
            d={secteur(R_DISQUE, R_DISQUE, i * L, (i + 1) * L)}
            fill={s.couleur}
            // Séparateurs aubergine : visibles entre deux segments clairs (lime, orange),
            // que des séparateurs crème laissaient se confondre.
            stroke={couleurs.aubergine}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        ))}
        {/* Gouttes lime décoratives sur le segment Joker (aubergine) */}
        {segments.map((s, i) =>
          s.couleur === couleurs.aubergine ? (
            <G key="deco" transform={`rotate(${centreSegment(i, segments.length)} ${R_DISQUE} ${R_DISQUE})`}>
              {[-16, 16].map((dx) => (
                <G key={dx} transform={`translate(${R_DISQUE + dx * 2.6 - 13} ${R_DISQUE - 180})`}>
                  <Path d={cheminGoutte(26, 36)} fill={couleurs.lime} />
                </G>
              ))}
            </G>
          ) : null,
        )}
      </Svg>
      {segments.map((s, i) => (
        <Libelle key={s.id} segment={s} index={i} nb={segments.length} />
      ))}
    </>
  );
});

const L_POINTEUR = 56;
const H_POINTEUR = 84;

/** Goutte aubergine pointe en bas, bordée de crème pour rester lisible sur la jante et les segments. */
const Pointeur = memo(function Pointeur() {
  return (
    <Svg width={L_POINTEUR + 8} height={H_POINTEUR + 8}>
      <G transform={`rotate(180 ${(L_POINTEUR + 8) / 2} ${(H_POINTEUR + 8) / 2}) translate(4 4)`}>
        <Path
          d={cheminGoutte(L_POINTEUR, H_POINTEUR)}
          fill={couleurs.aubergine}
          stroke={couleurs.surface}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
});

const LABEL_L = 260;
const LABEL_H = 110;

function Libelle({ segment: s, index, nb }: { segment: Segment; index: number; nb: number }) {
  const theta = centreSegment(index, nb);
  const r = R_DISQUE * 0.68;
  const x = R_DISQUE + r * Math.sin(rad(theta));
  const y = R_DISQUE - r * Math.cos(rad(theta));
  return (
    <View
      style={[styles.emplacement, { left: x - LABEL_L / 2, top: y - LABEL_H / 2, transform: [{ rotate: `${theta}deg` }] }]}
    >
      <View style={styles.cartouche}>
        <Ionicons name={s.icone} size={30} color={couleurs.aubergine} />
        <View>
          {s.lignes.map((ligne) => (
            <Texte key={ligne} style={styles.libelle}>
              {ligne}
            </Texte>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Petites perles sur la jante, qui s'allument à tour de rôle (toutes allumées, fixes, en mouvement réduit). */
function Ampoules({ pas, mode, reduit }: { pas: number; mode: ModeAmpoules; reduit: boolean }) {
  return (
    <>
      {Array.from({ length: NB_AMPOULES }, (_, i) => {
        const angle = (i * 360) / NB_AMPOULES;
        const x = C + R_AMPOULES * Math.sin(rad(angle));
        const y = C - R_AMPOULES * Math.cos(rad(angle));
        const allumee = reduit || (mode === 'fete' ? (i + pas) % 2 === 0 : (i + pas) % 4 < 2);
        return <Circle key={i} cx={x} cy={y} r={5} fill={allumee ? couleurs.lime : couleurs.aubergineDouce} />;
      })}
    </>
  );
}

function useChenillard(mode: ModeAmpoules, reduit: boolean): number {
  const [pas, setPas] = useState(0);
  useEffect(() => {
    if (reduit) return;
    // Lent : jamais plus de 3 clignotements par seconde.
    const intervalle = mode === 'rotation' ? 360 : 900;
    const id = setInterval(() => setPas((p) => (p + 1) % 1000), intervalle);
    return () => clearInterval(id);
  }, [mode, reduit]);
  return pas;
}

/** Web : la vue qui tourne passe sur sa propre couche (GPU). */
const COMPOSITEUR = { willChange: 'transform' } as unknown as ViewStyle;

const TAILLE_BOUTON = 196;

const styles = StyleSheet.create({
  disque: {
    position: 'absolute',
    left: C - R_DISQUE,
    top: C - R_DISQUE,
    width: R_DISQUE * 2,
    height: R_DISQUE * 2,
  },
  emplacement: {
    position: 'absolute',
    width: LABEL_L,
    height: LABEL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartouche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  libelle: { fontFamily: polices.extraGras, fontSize: tailles.libelle, lineHeight: 28 },
  pointeur: {
    position: 'absolute',
    left: C - (L_POINTEUR + 8) / 2,
    // Le corps de la goutte chevauche le haut de la jante, la pointe mord sur le disque.
    top: C - R_EXTERIEUR - 20,
    width: L_POINTEUR + 8,
    height: H_POINTEUR + 8,
    // Oscille autour de son attache, en haut.
    transformOrigin: '50% 0%',
  },
  centre: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  anneauCreme: {
    width: TAILLE_BOUTON + 24,
    height: TAILLE_BOUTON + 24,
    ...ombres.flottante,
    borderRadius: rayons.plein,
    backgroundColor: couleurs.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bouton: {
    width: TAILLE_BOUTON,
    height: TAILLE_BOUTON,
    borderRadius: 999,
    backgroundColor: couleurs.aubergine,
    borderColor: couleurs.lime,
    borderWidth: 12,
  },
  texteBouton: { fontFamily: polices.extraGras, fontSize: 44, color: couleurs.creme },
});
