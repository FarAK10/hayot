import {
  Catalog,
  CatalogResponse,
  Field,
  FieldType,
  LoadStatus,
  RawField,
} from '../models/catalog.models';

export const byOrd = <T extends { ord: number }>(first: T, second: T): number =>
  first.ord - second.ord;

const normalizeField = (field: RawField): Field => {
  if (field.type !== FieldType.Select) {
    return field;
  }
  const { values, ...rest } = field;
  return { ...rest, options: [...(values ?? [])].sort(byOrd) };
};

export function normalizeCatalog(data: CatalogResponse): Catalog {
  return {
    categories: [...data.categories].sort(byOrd),
    recipients: [...data.recipients].sort(byOrd),
    fields: data.fields.map(normalizeField).sort(byOrd),
  };
}

export const isCatalogPending = (status: LoadStatus): boolean =>
  status === LoadStatus.Idle || status === LoadStatus.Loading;
