/** Stable, human-friendly identifier shown and accepted by catalog search. */
export function getCatalogCode(id: string) {
  return `FL-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
