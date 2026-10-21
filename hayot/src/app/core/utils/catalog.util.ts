import { CatalogResponse, LoadStatus } from '../models/catalog.models';

export const byOrd = <T extends { ord: number }>(first: T, second: T): number =>
  first.ord - second.ord;

export function normalizeCatalog(data: CatalogResponse): CatalogResponse {
  return {
    categories: [...data.categories].sort(byOrd),
    recipients: [...data.recipients].sort(byOrd),
    fields: [...data.fields]
      .map((field) => (field.values ? { ...field, values: [...field.values].sort(byOrd) } : field))
      .sort(byOrd),
  };
}

export const isCatalogPending = (status: LoadStatus): boolean =>
  status === LoadStatus.Idle || status === LoadStatus.Loading;
