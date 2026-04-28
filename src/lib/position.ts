/**
 * Float position field — midpoint insertion algorithm.
 *
 * Diğer kartların pozisyonları sabit kalır; yalnızca taşınan kartın
 * yeni pozisyonu hesaplanır. Bu sayede her hareket tek bir UPDATE'tir.
 *
 * Kullanım:
 *   - Listenin başına: positionBefore(items[0].position)
 *   - Listenin sonuna: positionAfter(items[items.length-1].position)
 *   - İki öğe arasına: positionBetween(prev.position, next.position)
 *   - Boş listeye:    POSITION_BASE
 */

export const POSITION_BASE = 1024;
export const POSITION_GAP = 1024;

export function positionAfter(last: number | null | undefined): number {
  if (last == null) return POSITION_BASE;
  return last + POSITION_GAP;
}

export function positionBefore(first: number | null | undefined): number {
  if (first == null) return POSITION_BASE;
  return first / 2;
}

export function positionBetween(prev: number, next: number): number {
  return (prev + next) / 2;
}

/**
 * Yeni indexe taşırken pozisyonu hesapla.
 *
 * @param sortedPositions  Hedef sütundaki kartların CURRENT pozisyonları (artan sırada,
 *                         taşınan kart hariç).
 * @param newIndex         Kartın yeni indexi (0 = en üst).
 */
export function computeNewPosition(sortedPositions: number[], newIndex: number): number {
  const n = sortedPositions.length;
  if (n === 0) return POSITION_BASE;
  if (newIndex <= 0) return positionBefore(sortedPositions[0]);
  if (newIndex >= n) return positionAfter(sortedPositions[n - 1]);
  return positionBetween(sortedPositions[newIndex - 1], sortedPositions[newIndex]);
}
