// Helpers de conversion vers BigInt aux frontières (FormData, arguments
// d'action, cursors de pagination). Renvoient `null` quand la valeur est
// absente/vide/invalide plutôt que de throw, pour laisser la couche appelante
// choisir le message d'erreur.

export function toBigInt(value: unknown): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return BigInt(value as string | number | bigint);
  } catch {
    return null;
  }
}

// Parse une liste d'ids et déduplique (utile pour les tables de liaison à clé
// primaire composite : post_topic, etc.).
export function toBigIntList(values: (string | number | bigint)[]): bigint[] {
  const out: bigint[] = [];
  for (const value of values) {
    const parsed = toBigInt(value);
    if (parsed !== null) out.push(parsed);
  }
  return [...new Set(out)];
}
