import { groupBy, indexBy } from './collection.util';

interface Item {
  id: number;
  group: string;
}

describe('collection.util', () => {
  const first: Item = { id: 1, group: 'a' };
  const second: Item = { id: 2, group: 'b' };
  const third: Item = { id: 3, group: 'a' };
  const items = [first, second, third];

  it('groups items by key, keeping the input order inside a group', () => {
    const expected = new Map([
      ['a', [first, third]],
      ['b', [second]],
    ]);

    expect(groupBy(items, (item) => item.group)).toEqual(expected);
  });

  it('returns an empty map for no items', () => {
    expect(groupBy([], (item: Item) => item.group).size).toBe(0);
    expect(indexBy([], (item: Item) => item.id).size).toBe(0);
  });

  it('indexes items by a unique key', () => {
    const expected = new Map([
      [first.id, first],
      [second.id, second],
      [third.id, third],
    ]);

    expect(indexBy(items, (item) => item.id)).toEqual(expected);
  });
});
