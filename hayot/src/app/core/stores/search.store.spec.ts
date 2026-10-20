import { Category, Recipient } from '../models/catalog.models';
import { searchCatalog } from './search.store';

const cat = (id: number, ord: number, ru: string, en: string): Category => ({
  id,
  ord,
  logo: '',
  name: { ru, en, uz: en },
});
const rec = (id: number, categoryId: number, name: string, full = name): Recipient => ({
  id,
  categoryId,
  ord: 1,
  logo: '',
  commission: 1,
  minAmount: 0,
  maxAmount: 0,
  name: { ru: name, uz: name, en: name },
  fullName: { ru: full, uz: full, en: full },
});

const categories = [cat(1, 1, 'Мобильная связь', 'Mobile'), cat(2, 2, 'Коммунальные услуги', 'Utilities')];
const recipients: Record<number, Recipient[]> = {
  1: [rec(10, 1, 'Beeline ', 'OOO UNITEL'), rec(11, 1, 'UCell', 'OOO COSCOM')],
  2: [rec(20, 2, 'Электроэнергия'), rec(21, 2, 'Горячая вода')],
};
const run = (q: string) => searchCatalog(q, categories, (id) => recipients[id]);

describe('searchCatalog', () => {
  it('is case-insensitive and partial', () => {
    expect(run('BEEL')[0].recipients.map((r) => r.id)).toEqual([10]);
    expect(run('ucell')[0].recipients.map((r) => r.id)).toEqual([11]);
  });
  it('matches fullName', () => expect(run('unitel')[0].recipients[0].id).toBe(10));
  it('matches Russian names and ё', () => {
    expect(run('электр')[0].recipients[0].id).toBe(20);
    expect(run('горячая')[0].recipients[0].id).toBe(21);
  });
  it('includes every recipient on a category-name match', () => {
    expect(run('коммунал')[0].recipients.map((r) => r.id)).toEqual([20, 21]);
    expect(run('mobile')[0].recipients.map((r) => r.id)).toEqual([10, 11]);
  });
  it('returns nothing for empty or unknown queries', () => {
    expect(run('  ')).toEqual([]);
    expect(run('zzz')).toEqual([]);
  });
});
