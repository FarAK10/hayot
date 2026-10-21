import { CatalogResponse, Field, LoadStatus, isSelectField } from '../models/catalog.models';

export const byOrd = <T extends { ord: number }>(first: T, second: T): number =>
  first.ord - second.ord;

const normalizeField = (field: Field): Field =>
  isSelectField(field) ? { ...field, values: [...(field.values ?? [])].sort(byOrd) } : field;

export function normalizeCatalog(data: CatalogResponse): CatalogResponse {
  return {
    categories: [...data.categories].sort(byOrd),
    recipients: [...data.recipients].sort(byOrd),
    fields: data.fields.map(normalizeField).sort(byOrd),
  };
}

export const isCatalogPending = (status: LoadStatus): boolean =>
  status === LoadStatus.Idle || status === LoadStatus.Loading;
