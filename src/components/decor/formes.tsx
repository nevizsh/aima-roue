import Svg, { Ellipse, G, Path } from 'react-native-svg';
import { couleurs } from '../../config/theme';

/** Goutte pointe en haut, inscrite dans un rectangle l × h (pointe en (l/2, 0)). */
export function cheminGoutte(l: number, h: number): string {
  const r = l / 2;
  const cy = h - r;
  return [
    `M ${r} 0`,
    `C ${r + r * 0.25} ${h * 0.28}, ${l} ${cy - r * 0.55}, ${l} ${cy}`,
    `A ${r} ${r} 0 0 1 0 ${cy}`,
    `C 0 ${cy - r * 0.55}, ${r - r * 0.25} ${h * 0.28}, ${r} 0 Z`,
  ].join(' ');
}

/** Goutte pointe en bas, pointe à l'origine, corps vers le haut. */
function cheminGouttePointeEnBas(l: number, h: number): string {
  const r = l / 2;
  const cy = -(h - r);
  return [
    'M 0 0',
    `C ${r * 0.25} ${-h * 0.28}, ${r} ${cy + r * 0.55}, ${r} ${cy}`,
    `A ${r} ${r} 0 0 0 ${-r} ${cy}`,
    `C ${-r} ${cy + r * 0.55}, ${-r * 0.25} ${-h * 0.28}, 0 0 Z`,
  ].join(' ');
}

/** Petit cœur formé de deux gouttes (remplace les gemmes de la référence). */
export function CoeurGouttes({ taille, couleur }: { taille: number; couleur: string }) {
  const goutte = cheminGouttePointeEnBas(46, 66);
  return (
    <Svg width={taille} height={taille} viewBox="0 0 100 100" aria-hidden>
      <G transform="translate(50 94)">
        <Path d={goutte} fill={couleur} transform="rotate(-32)" />
        <Path d={goutte} fill={couleur} transform="rotate(32)" />
      </G>
      {/* Reflet : une forme plus claire, en aplat. */}
      <Ellipse cx={30} cy={36} rx={8} ry={12} fill={couleurs.creme} opacity={0.75} transform="rotate(-30 30 36)" />
    </Svg>
  );
}
