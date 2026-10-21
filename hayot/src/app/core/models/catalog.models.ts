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

interface FieldBase {
  id: number;
  key: string;
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
}

export interface AmountField extends FieldBase {
  type: FieldType.Amount;
}

export interface SelectField extends FieldBase {
  type: FieldType.Select;
  values: FieldOption[];
}

export interface TextField extends FieldBase {
  type: FieldType.Text | FieldType.PhoneNumber;
}

export type Field = AmountField | SelectField | TextField;

export type FieldValue = string | number | null;

export const isAmountField = (field: Field): field is AmountField =>
  field.type === FieldType.Amount;

export const isSelectField = (field: Field): field is SelectField =>
  field.type === FieldType.Select;

export interface CatalogResponse {
  categories: Category[];
  recipients: Recipient[];
  fields: Field[];
}
