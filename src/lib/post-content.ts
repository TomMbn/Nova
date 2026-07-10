/**
 * Convention d'affichage sans colonne dédiée : la première ligne du champ
 * `content` (si suivie d'au moins une autre ligne) sert de titre en gras,
 * le reste s'affiche en texte normal. Un post sur une seule ligne reste
 * affiché tel quel (en gras), comme avant.
 */
export function splitPostContent(content: string): {
  title: string | null;
  body: string;
} {
  const newlineIndex = content.indexOf("\n");
  if (newlineIndex === -1) return { title: null, body: content };

  const title = content.slice(0, newlineIndex).trim();
  const body = content.slice(newlineIndex + 1).trim();
  if (!title || !body) return { title: null, body: content };

  return { title, body };
}
