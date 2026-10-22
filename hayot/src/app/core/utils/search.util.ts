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

const foldYo = (text: string): string => text.toLowerCase().replace(/ё/g, 'е');

export const normalize = (text: string): string => foldYo(text).trim();

export const transliterate = (text: string): string =>
  [...normalize(text)].map((letter) => CYR_TO_LAT[letter] ?? letter).join('');

export function matchesQuery(query: string, haystacks: readonly string[]): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return true;
  }
  const transliteratedQuery = transliterate(query);
  const matchesHaystack = (haystack: string): boolean =>
    normalize(haystack).includes(normalizedQuery) ||
    transliterate(haystack).includes(transliteratedQuery);
  return haystacks.some(matchesHaystack);
}

export function highlight(text: string, query: string): { text: string; match: boolean }[] {
  const normalizedQuery = normalize(query);
  const matchStart = normalizedQuery ? foldYo(text).indexOf(normalizedQuery) : -1;
  if (matchStart < 0) {
    return [{ text, match: false }];
  }
  const matchEnd = matchStart + normalizedQuery.length;
  const parts = [
    { text: text.slice(0, matchStart), match: false },
    { text: text.slice(matchStart, matchEnd), match: true },
    { text: text.slice(matchEnd), match: false },
  ];
  return parts.filter((part) => part.text);
}

export interface SearchGroup {
  category: Category;
  recipients: Recipient[];
}

const allLangs = (text: Localized | undefined): string[] => {
  const variants = LANGS.map((lang) => text?.[lang] ?? '');
  return variants.filter(Boolean);
};

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
    const matchesRecipient = (recipient: Recipient): boolean => {
      const haystacks = [...allLangs(recipient.name), ...allLangs(recipient.fullName)];
      return matchesQuery(query, haystacks);
    };
    const recipients = matchesQuery(query, allLangs(category.name))
      ? [...all]
      : all.filter(matchesRecipient);
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
