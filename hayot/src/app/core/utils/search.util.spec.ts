import { Category, Recipient } from '../models/catalog.models';
import { searchCatalog } from './search.util';

enum CategoryId {
  Mobile = 1,
  Utilities = 2,
}

enum RecipientId {
  Beeline = 10,
  UCell = 11,
  Electricity = 20,
  HotWater = 21,
}

const DEFAULT_ORD = 1;
const DEFAULT_COMMISSION = 1;
const NO_LIMIT = 0;

const category = (id: CategoryId, ru: string, en: string): Category => ({
  id,
  ord: id,
  logo: '',
  name: { ru, en, uz: en },
});
const recipient = (
  id: RecipientId,
  categoryId: CategoryId,
  name: string,
  full = name,
): Recipient => ({
  id,
  categoryId,
  ord: DEFAULT_ORD,
  logo: '',
  commission: DEFAULT_COMMISSION,
  minAmount: NO_LIMIT,
  maxAmount: NO_LIMIT,
  name: { ru: name, uz: name, en: name },
  fullName: { ru: full, uz: full, en: full },
});

const categories = [
  category(CategoryId.Mobile, 'Мобильная связь', 'Mobile'),
  category(CategoryId.Utilities, 'Коммунальные услуги', 'Utilities'),
];
const recipients: Record<CategoryId, Recipient[]> = {
  [CategoryId.Mobile]: [
    recipient(RecipientId.Beeline, CategoryId.Mobile, 'Beeline ', 'OOO UNITEL'),
    recipient(RecipientId.UCell, CategoryId.Mobile, 'UCell', 'OOO COSCOM'),
  ],
  [CategoryId.Utilities]: [
    recipient(RecipientId.Electricity, CategoryId.Utilities, 'Электроэнергия'),
    recipient(RecipientId.HotWater, CategoryId.Utilities, 'Горячая вода'),
  ],
};
const run = (query: string) =>
  searchCatalog(query, categories, (id) => recipients[id as CategoryId]);
const idsOf = (query: string) => run(query)[0].recipients.map((item) => item.id);

describe('searchCatalog', () => {
  it('is case-insensitive and partial', () => {
    expect(idsOf('BEEL')).toEqual([RecipientId.Beeline]);
    expect(idsOf('ucell')).toEqual([RecipientId.UCell]);
  });
  it('matches fullName', () => expect(idsOf('unitel')).toEqual([RecipientId.Beeline]));
  it('matches Russian names and ё', () => {
    expect(idsOf('электр')).toEqual([RecipientId.Electricity]);
    expect(idsOf('горячая')).toEqual([RecipientId.HotWater]);
  });
  it('includes every recipient on a category-name match', () => {
    expect(idsOf('коммунал')).toEqual([RecipientId.Electricity, RecipientId.HotWater]);
    expect(idsOf('mobile')).toEqual([RecipientId.Beeline, RecipientId.UCell]);
  });
  it('returns nothing for empty or unknown queries', () => {
    expect(run('  ')).toEqual([]);
    expect(run('zzz')).toEqual([]);
  });
});
