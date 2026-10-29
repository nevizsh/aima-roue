import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { textes } from '../config/content';
import { couleurs, polices, rayons } from '../config/theme';
import { Texte } from './base';
import { cheminGoutte } from './decor/formes';

export const LARGEUR_SOCLE = 440;
export const HAUTEUR_SOCLE = 78;

/** Plaque « 3 lancers, 3 questions » sous la roue, en aplat aubergine (sans pied en laiton). */
export function Socle() {
  return (
    <View style={styles.plaque}>
      <Goutte />
      <Texte style={styles.texte}>{textes.sousTitre}</Texte>
      <Goutte />
    </View>
  );
}

function Goutte() {
  return (
    <Svg width={32} height={48} aria-hidden>
      <Path d={cheminGoutte(32, 48)} fill={couleurs.lime} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  plaque: {
    width: LARGEUR_SOCLE,
    height: HAUTEUR_SOCLE,
    borderRadius: rayons.plein,
    backgroundColor: couleurs.aubergine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  texte: { fontFamily: polices.extraGras, fontSize: 26, color: couleurs.creme },
});
