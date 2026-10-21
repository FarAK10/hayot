import { Category, LANGS, Localized, Recipient } from '../models/catalog.models';

const CYR_TO_LAT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ы: 'i',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ъ: '',
  ь: '',
};

export const normalize = (s: string): string => s.toLowerCase().replace(/ё/g, 'е').trim();

export const transliterate = (s: string): string =>
  [...normalize(s)].map((c) => CYR_TO_LAT[c] ?? c).join('');

export function matchesQuery(query: string, haystacks: readonly string[]): boolean {
  const q = normalize(query);
  if (!q) {
    return true;
  }
  const qt = transliterate(query);
  return haystacks.some((h) => normalize(h).includes(q) || transliterate(h).includes(qt));
}

export function highlight(text: string, query: string): { text: string; match: boolean }[] {
  const q = normalize(query);
  const idx = q ? text.toLowerCase().replace(/ё/g, 'е').indexOf(q) : -1;
  if (idx < 0) {
    return [{ text, match: false }];
  }
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text);
}

export interface SearchGroup {
  category: Category;
  recipients: Recipient[];
}

const allLangs = (text: Localized | undefined): string[] =>
  LANGS.map((l) => text?.[l] ?? '').filter(Boolean);

export function searchCatalog(
  query: string,
  categories: readonly Category[],
  recipientsOf: (categoryId: number) => readonly Recipient[],
): SearchGroup[] {
  if (!normalize(query)) {
    return [];
  }
  const groups: SearchGroup[] = [];
  for (const category of categories) {
    const all = recipientsOf(category.id);
    const recipients = matchesQuery(query, allLangs(category.name))
      ? [...all]
      : all.filter((r) => matchesQuery(query, [...allLangs(r.name), ...allLangs(r.fullName)]));
    if (recipients.length) {
      groups.push({ category, recipients });
    }
  }
  return groups;
}

export function catalogGroups(
  query: string,
  categories: readonly Category[],
  recipientsOf: (categoryId: number) => readonly Recipient[],
): SearchGroup[] {
  if (normalize(query)) {
    return searchCatalog(query, categories, recipientsOf);
  }
  return categories.map((category) => ({ category, recipients: [...recipientsOf(category.id)] }));
}
