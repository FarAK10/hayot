export type Lang = 'ru' | 'uz' | 'en';
export const LANGS: readonly Lang[] = ['ru', 'uz', 'en'];

export type Localized = Partial<Record<Lang, string>>;

export enum FieldType {
  Text = 'TEXT',
  PhoneNumber = 'PHONE_NUMBER',
  Amount = 'AMOUNT',
  Select = 'SELECT',
}

export enum LoadStatus {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

export interface Category {
  id: number;
  logo: string;
  ord: number;
  name: Localized;
}

export interface Recipient {
  id: number;
  logo: string;
  ord: number;
  categoryId: number;
  commission: number;
  minAmount: number;
  maxAmount: number;
  name: Localized;
  fullName: Localized;
}

export interface FieldOption {
  value: string;
  filterBy: string | null;
  ord: number;
  name: Localized;
  description?: Localized;
}

export interface Field {
  id: number;
  key: string;
  type: FieldType;
  validation: string | null;
  placeholder: string | null;
  mask: string | null;
  lengthMin: number | null;
  lengthMax: number | null;
  requireField: string | null;
  required: boolean;
  ord: number;
  recipientId: number;
  filterBy: string | null;
  name: Localized;
  description?: Localized;
  values?: FieldOption[];
}

export interface CatalogResponse {
  categories: Category[];
  recipients: Recipient[];
  fields: Field[];
}
