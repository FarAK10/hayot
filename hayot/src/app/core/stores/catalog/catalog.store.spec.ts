import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryId, RAW_CATALOG, RecipientId } from '../../../testing/catalog.fixture';
import { CATALOG_URL } from '../../config/app.config.constants';
import { CatalogStore } from './catalog.store';

const SORTED_CATEGORY_ORDS = [1, 4, 23];
const ELECTRICITY_FIELD_KEYS = ['REGION', 'soato', 'SERVICE_ID', 'customer_code', 'summa'];

describe('CatalogStore', () => {
  function loaded() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const store = TestBed.inject(CatalogStore);
    store.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(RAW_CATALOG);
    return store;
  }

  it('sorts categories and recipients by ord', () => {
    const store = loaded();
    const expectedMobileRecipients = [RecipientId.Beeline, RecipientId.UCell];

    expect(store.categories().map((category) => category.ord)).toEqual(SORTED_CATEGORY_ORDS);
    expect(store.recipientsOf(CategoryId.Mobile).map((recipient) => recipient.id)).toEqual(
      expectedMobileRecipients,
    );
  });

  it('returns Electricity fields in ord order', () => {
    const store = loaded();

    expect(store.fieldsFor(RecipientId.Electricity).map((field) => field.key)).toEqual(
      ELECTRICITY_FIELD_KEYS,
    );
  });

  it('sorts select values by ord', () => {
    const store = loaded();
    const soato = store.fieldsFor(RecipientId.Electricity).find((field) => field.key === 'soato')!;
    const ords = soato.values!.map((value) => value.ord);

    expect(ords).toEqual([...ords].sort((first, second) => first - second));
  });

  it('flags load errors', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const store = TestBed.inject(CatalogStore);
    store.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).error(new ProgressEvent('error'));

    expect(store.failed()).toBe(true);
  });
});
