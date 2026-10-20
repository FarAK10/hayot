import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import data from '../../../../public/data/response.json';
import { CatalogResponse } from '../models/catalog.models';
import { CATALOG_URL, CatalogStore } from './catalog.store';

describe('CatalogStore', () => {
  async function loaded() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const store = TestBed.inject(CatalogStore);
    const p = store.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(data as unknown as CatalogResponse);
    await p;
    return store;
  }

  it('sorts categories and recipients by ord', async () => {
    const store = await loaded();
    expect(store.categories().map((c) => c.ord)).toEqual([1, 4, 23]);
    expect(store.recipientsOf(1151).map((r) => r.id)).toEqual([23303, 4427]);
  });

  it('returns Electricity fields in ord order', async () => {
    const store = await loaded();
    expect(store.fieldsFor(4012).map((f) => f.key)).toEqual([
      'REGION',
      'soato',
      'SERVICE_ID',
      'customer_code',
      'summa',
    ]);
  });

  it('sorts select values by ord', async () => {
    const store = await loaded();
    const soato = store.fieldsFor(4012).find((f) => f.key === 'soato')!;
    const ords = soato.values!.map((v) => v.ord);
    expect(ords).toEqual([...ords].sort((a, b) => a - b));
  });

  it('flags load errors', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const store = TestBed.inject(CatalogStore);
    const p = store.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).error(new ProgressEvent('error'));
    await p;
    expect(store.failed()).toBe(true);
  });
});
