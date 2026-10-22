import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AMOUNT_DIVISOR, CATALOG_URL } from '../../../../core/config/app.config.constants';
import {
  optionsByKeyOf,
  visibleFieldsOf,
} from '../../../../core/form-engine/field-visibility.util';
import { DynamicForm } from '../../../../core/form-engine/utils/dynamic-control.util';
import { CatalogStore } from '../../../../core/stores/catalog/catalog.store';
import {
  RAW_CATALOG,
  RecipientId,
  Region,
  fieldsOf,
  recipientOf,
} from '../../../../testing/catalog.fixture';
import { PaymentFormService } from './payment-form.service';

const SOATO_OPTIONS_COUNT = { [Region.TashkentRegion]: 22, [Region.TashkentCity]: 11 };
const TASHKENT_CITY_SERVICE = '3014,3013';
const INITIAL_FIELD_KEYS = ['REGION', 'customer_code', 'summa'];
const REVEALED_FIELD_KEYS = ['REGION', 'soato', 'SERVICE_ID', 'customer_code', 'summa'];

describe('PaymentFormService (Electricity)', () => {
  const electricityFields = fieldsOf(RecipientId.Electricity);

  function build(): DynamicForm {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PaymentFormService,
        { provide: MAT_DIALOG_DATA, useValue: { recipientId: RecipientId.Electricity } },
      ],
    });
    TestBed.inject(CatalogStore).load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(RAW_CATALOG);
    return TestBed.inject(PaymentFormService).dynamicForm;
  }

  const visibleKeys = (form: DynamicForm) =>
    visibleFieldsOf(electricityFields, form.getRawValue()).map((field) => field.key);

  const optionsOf = (form: DynamicForm, key: string) =>
    optionsByKeyOf(electricityFields, form.getRawValue())[key];

  it('shows only REGION, customer_code and summa initially, in ord order', () => {
    expect(visibleKeys(build())).toEqual(INITIAL_FIELD_KEYS);
  });

  it('reveals dependents and resets them when REGION changes', () => {
    const form = build();
    form.controls['REGION'].setValue(Region.TashkentRegion);
    expect(visibleKeys(form)).toEqual(REVEALED_FIELD_KEYS);
    expect(optionsOf(form, 'soato')).toHaveLength(SOATO_OPTIONS_COUNT[Region.TashkentRegion]);

    form.controls['soato'].setValue(optionsOf(form, 'soato')[0].value);
    form.controls['SERVICE_ID'].setValue(optionsOf(form, 'SERVICE_ID')[0].value);
    form.controls['REGION'].setValue(Region.TashkentCity);
    expect(form.controls['soato'].value).toBe('');
    expect(optionsOf(form, 'soato')).toHaveLength(SOATO_OPTIONS_COUNT[Region.TashkentCity]);
  });

  it('auto-selects the only service for Tashkent city', () => {
    const form = build();
    form.controls['REGION'].setValue(Region.TashkentCity);
    expect(form.controls['SERVICE_ID'].value).toBe(TASHKENT_CITY_SERVICE);
  });

  it('is valid once every visible field of Tashkent city is filled', () => {
    const form = build();
    const validCustomerCode = '1234567';
    const validAmountSum = recipientOf(RecipientId.Electricity).minAmount / AMOUNT_DIVISOR;
    form.controls['REGION'].setValue(Region.TashkentCity);
    form.controls['soato'].setValue(optionsOf(form, 'soato')[0].value);
    form.controls['customer_code'].setValue(validCustomerCode);
    form.controls['summa'].setValue(validAmountSum);

    expect(form.valid).toBe(true);
  });

  it('excludes hidden controls from form.value', () => {
    const form = build();
    expect(Object.keys(form.value).sort()).toEqual(['REGION', 'customer_code', 'summa']);
    expect('soato' in form.value).toBe(false);
    form.controls['REGION'].setValue(Region.TashkentRegion);
    expect('soato' in form.value).toBe(true);
    form.controls['REGION'].setValue('');
    expect('soato' in form.value).toBe(false);
  });
});
