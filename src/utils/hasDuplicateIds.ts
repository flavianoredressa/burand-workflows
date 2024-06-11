export function hasDuplicateIds(arr: { id: string }[]) {
  const idSet = new Set();
  for (const item of arr) {
    if (idSet.has(item.id)) {
      throw new Error(`Duplicate worker id: ${item.id}`);
    }
    idSet.add(item.id);
  }
  idSet.clear();
}
