import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryId, RAW_CATALOG, RecipientId } from '../../../testing/catalog.fixture';
import { CATALOG_URL } from '../../config/app.config.constants';
import { isSelectField } from '../../models/catalog.models';
import { CatalogStore } from './catalog.store';

const SORTED_CATEGORY_ORDS = [1, 4, 23];
const ELECTRICITY_FIELD_KEYS = ['REGION', 'soato', 'SERVICE_ID', 'customer_code', 'summa'];

describe('CatalogStore', () => {
  function loaded() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const catalogStore = TestBed.inject(CatalogStore);
    catalogStore.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(RAW_CATALOG);
    return catalogStore;
  }

  it('sorts categories and recipients by ord', () => {
    const catalogStore = loaded();
    const expectedFirstMobileRecipients = [RecipientId.Beeline, RecipientId.UCell];
    const mobileRecipients = catalogStore.recipientsOf(CategoryId.Mobile);
    const mobileOrds = mobileRecipients.map((recipient) => recipient.ord);

    expect(catalogStore.categories().map((category) => category.ord)).toEqual(SORTED_CATEGORY_ORDS);
    expect(
      mobileRecipients
        .slice(0, expectedFirstMobileRecipients.length)
        .map((recipient) => recipient.id),
    ).toEqual(expectedFirstMobileRecipients);
    expect(mobileOrds).toEqual([...mobileOrds].sort((first, second) => first - second));
  });

  it('returns Electricity fields in ord order', () => {
    const catalogStore = loaded();

    expect(catalogStore.getFieldsFor(RecipientId.Electricity).map((field) => field.key)).toEqual(
      ELECTRICITY_FIELD_KEYS,
    );
  });

  it('sorts select values by ord', () => {
    const catalogStore = loaded();
    const soato = catalogStore
      .getFieldsFor(RecipientId.Electricity)
      .filter(isSelectField)
      .find((field) => field.key === 'soato')!;
    const ords = soato.values.map((value) => value.ord);

    expect(ords).toEqual([...ords].sort((first, second) => first - second));
  });

  it('flags load errors', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const catalogStore = TestBed.inject(CatalogStore);
    catalogStore.load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).error(new ProgressEvent('error'));

    expect(catalogStore.failed()).toBe(true);
  });
});
