export function groupBy<Item, Key>(
  items: readonly Item[],
  keyOf: (item: Item) => Key,
): Map<Key, Item[]> {
  const groups = new Map<Key, Item[]>();
  for (const item of items) {
    const key = keyOf(item);
    const siblings = groups.get(key) ?? [];
    siblings.push(item);
    groups.set(key, siblings);
  }
  return groups;
}

export const indexBy = <Item, Key>(
  items: readonly Item[],
  keyOf: (item: Item) => Key,
): Map<Key, Item> => new Map(items.map((item) => [keyOf(item), item]));
