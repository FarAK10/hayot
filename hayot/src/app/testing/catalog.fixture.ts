import data from '../../../public/data/response.json';
import {
  CatalogResponse,
  Field,
  Recipient,
  SelectField,
  isSelectField,
} from '../core/models/catalog.models';
import { normalizeCatalog } from '../core/utils/catalog.util';

export const RAW_CATALOG = data as unknown as CatalogResponse;
export const catalog = normalizeCatalog(RAW_CATALOG);

export enum CategoryId {
  Mobile = 1151,
  Tourism = 24201,
  Utilities = 24202,
}

export enum RecipientId {
  Electricity = 4012,
  Beeline = 23303,
  UCell = 4427,
  AlArabiya = 4839,
}

export enum Region {
  TashkentRegion = '2159',
  TashkentCity = '2115',
}

export const recipientOf = (id: RecipientId): Recipient =>
  catalog.recipients.find((recipient) => recipient.id === id)!;

export const fieldsOf = (id: RecipientId): Field[] =>
  catalog.fields.filter((field) => field.recipientId === id);

export const fieldOf = (id: RecipientId, key: string): Field =>
  fieldsOf(id).find((field) => field.key === key)!;

export function selectFieldOf(id: RecipientId, key: string): SelectField {
  const field = fieldOf(id, key);
  if (!isSelectField(field)) {
    throw new Error('Field ' + key + ' is not a SELECT');
  }
  return field;
}
