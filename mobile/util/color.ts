export function convertHexToRGBA(color: string, alpha: number = 1) {
  const hexColor = color.replace("#", "");
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


export function tintColor(color: string, tintFactor: number = 0.1): string {
  const hasHash = color.startsWith('#');
  const hexColor = hasHash ? color.substring(1) : color;

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  const deltaR = 255 - r;
  const deltaG = 255 - g;
  const deltaB = 255 - b;

  const newR = Math.round(r + deltaR * tintFactor);
  const newG = Math.round(g + deltaG * tintFactor);
  const newB = Math.round(b + deltaB * tintFactor);

  const tintedHex = newR.toString(16).padStart(2, '0') +
      newG.toString(16).padStart(2, '0') +
      newB.toString(16).padStart(2, '0');

  return hasHash ? `#${tintedHex}` : tintedHex;
}

export function shadeColor(color: string, shadeFactor: number = 0.1): string {
  const hasHash = color.startsWith('#');
  const hexColor = hasHash ? color.substring(1) : color;

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  const newR = Math.round(r * (1 - shadeFactor));
  const newG = Math.round(g * (1 - shadeFactor));
  const newB = Math.round(b * (1 - shadeFactor));

  const shadedHex = newR.toString(16).padStart(2, '0') +
      newG.toString(16).padStart(2, '0') +
      newB.toString(16).padStart(2, '0');

  return hasHash ? `#${shadedHex}` : shadedHex;
}