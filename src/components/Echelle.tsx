import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { libellesPaliers, libellesPaliersAccessibles, nomsObjets, textes } from '../config/content';
import { couleurs, ombres, polices, rayons } from '../config/theme';
import type { ObjetEpuisable, Palier } from '../domain/types';
import { PALIERS, recompense } from '../logic/recompense';
import { Texte } from './base';
import { IllustrationObjet } from './Objets';

/**
 * Échelle « Tes récompenses », information secondaire : la carte du centre (titre, règle,
 * bouton) doit rester ce qu'on lit en premier. D'où des marches plates, sans ombre, un titre
 * et des noms en couleur secondaire ; seul le palier atteint ressort, en lime.
 * Les objets viennent de recompense() : un objet épuisé n'y apparaît jamais.
 */
export function Echelle({ epuises, atteint }: { epuises: readonly ObjetEpuisable[]; atteint: Palier | null }) {
  return (
    <View style={styles.echelle}>
      <Texte style={styles.titre} role="heading">
        {textes.echelleTitre}
      </Texte>
      <View style={styles.marches}>
        {PALIERS.map(({ palier, bonnes }) => {
          const { objets } = recompense(bonnes, epuises);
          const noms = objets.map((o) => nomsObjets[o]).join(' + ');
          const allume = palier === atteint;
          return (
            <View
              key={palier}
              accessible
              accessibilityLabel={textes.palierAccessible(libellesPaliersAccessibles[palier], noms, allume)}
              style={[styles.marche, allume && styles.marcheAllumee]}
            >
              {allume && (
                <View style={styles.atteint}>
                  <Ionicons name="star" size={20} color={couleurs.aubergine} />
                  <Texte style={styles.texteAtteint}>{textes.palierAtteint}</Texte>
                </View>
              )}
              <Texte style={styles.palier}>{libellesPaliers[palier]}</Texte>
              <View style={styles.objets}>
                {objets.map((o) => (
                  <IllustrationObjet key={o} id={o} taille={44} />
                ))}
              </View>
              <Texte style={[styles.noms, allume && styles.nomsAllumes]}>{noms}</Texte>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Remontée au-dessus du bas de la scène : lue à 2 m, elle ne doit pas être collée au bord.
  echelle: { width: '100%', gap: 10, marginBottom: 48 },
  titre: { fontFamily: polices.gras, fontSize: 26, color: couleurs.aubergineDouce },
  marches: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  marche: {
    flex: 1,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcheAllumee: { backgroundColor: couleurs.lime },
  atteint: {
    position: 'absolute',
    top: -22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...ombres.flottante,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.plein,
    paddingHorizontal: 12,
  },
  texteAtteint: { fontFamily: polices.extraGras, fontSize: 24 },
  palier: { fontFamily: polices.extraGras, fontSize: 28 },
  objets: { flexDirection: 'row', gap: 8 },
  noms: { fontFamily: polices.gras, fontSize: 24, textAlign: 'center', color: couleurs.aubergineDouce },
  // Sur le lime, le gris secondaire tomberait à moins de 4,5:1 : retour à l'aubergine.
  nomsAllumes: { color: couleurs.aubergine },
});
