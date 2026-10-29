import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { couleurs } from '../../config/theme';
import { useBoucle } from '../../hooks/useBoucle';

/** Centre de la roue sur la scène 1920×1080 (partagé avec l'écran). */
export const CENTRE_ROUE = { x: 600, y: 555 } as const;
const RAYON_HALO = 480;

/** Fond crème de l'app Aïma : formes roses pâles en aplat et grand disque rose derrière la roue. */
export function Fond() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      <Svg width={1920} height={1080} style={StyleSheet.absoluteFill}>
        <Path d="M 1920 0 L 1340 0 C 1390 130 1540 150 1650 240 C 1760 330 1760 480 1920 520 Z" fill={couleurs.rose} />
        <Path d="M 1920 1080 L 1480 1080 C 1550 990 1690 960 1780 900 C 1850 850 1880 790 1920 770 Z" fill={couleurs.rose} />
        <Circle cx={CENTRE_ROUE.x - 40} cy={CENTRE_ROUE.y - 30} r={RAYON_HALO} fill={couleurs.rose} />
      </Svg>
    </View>
  );
}

type Forme = { x: number; y: number; l: number; h: number; couleur: string };

/** Pastilles et bâtonnets en aplat, comme les formes de l'app Aïma. */
const PASTILLES: Forme[] = [
  { x: 1010, y: 150, l: 56, h: 56, couleur: couleurs.corail },
  { x: 150, y: 870, l: 80, h: 80, couleur: couleurs.corailFonce },
  // Hors de la colonne de droite : collé à « Tes récompenses », il gênait la lecture.
  { x: 930, y: 1045, l: 76, h: 18, couleur: couleurs.petrole },
  { x: 175, y: 175, l: 40, h: 40, couleur: couleurs.lime },
  { x: 95, y: 540, l: 18, h: 64, couleur: couleurs.orange },
  { x: 1850, y: 990, l: 36, h: 36, couleur: couleurs.corail },
];

/** Pastilles qui flottent doucement (immobiles en mouvement réduit). */
export function Pastilles({ reduit }: { reduit: boolean }) {
  const t = useBoucle(!reduit, 3800);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      {PASTILLES.map((p, i) => {
        const translateY = reduit
          ? 0
          : t.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: i % 2 ? [0, -14, 0] : [-10, 6, -10],
            });
        return (
          <Animated.View
            key={i}
            style={[
              styles.pastille,
              { left: p.x - p.l / 2, top: p.y - p.h / 2, width: p.l, height: p.h, backgroundColor: p.couleur },
              { transform: [{ translateY }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pastille: { position: 'absolute', borderRadius: 999 },
});
