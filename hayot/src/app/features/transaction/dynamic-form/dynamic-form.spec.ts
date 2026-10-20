import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import data from '../../../../../public/data/response.json';
import { CatalogResponse, Field, Recipient } from '../../../core/models/catalog.models';
import { normalizeCatalog } from '../../../core/stores/catalog.store';
import { filterOptions, isVisible, dependentsOf } from './field-visibility';
import { FormBuilderService } from './form-builder.service';
import { buildValidators } from './validators.factory';

const catalog = normalizeCatalog(data as unknown as CatalogResponse);
const recipient = (id: number): Recipient => catalog.recipients.find((r) => r.id === id)!;
const fieldsOf = (id: number): Field[] => catalog.fields.filter((f) => f.recipientId === id);
const field = (rid: number, key: string): Field => fieldsOf(rid).find((f) => f.key === key)!;

function errorsFor(rid: number, key: string, value: string | number | null) {
  const c = new FormControl(value, buildValidators(field(rid, key), recipient(rid)));
  return c.errors;
}

describe('validators.factory', () => {
  it('UCell clientid: regex wins, lengthMax is not applied', () => {
    expect(errorsFor(4427, 'clientid', '931234567')).toBeNull();
    expect(errorsFor(4427, 'clientid', '901234567')).toHaveProperty('pattern');
    expect(errorsFor(4427, 'clientid', '93123456')).toHaveProperty('pattern');
    expect(errorsFor(4427, 'clientid', '')).toHaveProperty('required');
  });
  it('Beeline phone accepts 90 and 91 prefixes', () => {
    expect(errorsFor(23303, 'phone_number', '901234567')).toBeNull();
    expect(errorsFor(23303, 'phone_number', '911234567')).toBeNull();
    expect(errorsFor(23303, 'phone_number', '921234567')).toHaveProperty('pattern');
  });
  it('Al Arabiya client_id needs exactly 9 digits', () => {
    expect(errorsFor(4839, 'client_id', '123456789')).toBeNull();
    expect(errorsFor(4839, 'client_id', '12345678')).toHaveProperty('pattern');
    expect(errorsFor(4839, 'client_id', '1234567890')).toHaveProperty('pattern');
  });
  it('Electricity customer_code accepts 6-8 digits', () => {
    expect(errorsFor(4012, 'customer_code', '123456')).toBeNull();
    expect(errorsFor(4012, 'customer_code', '12345678')).toBeNull();
    expect(errorsFor(4012, 'customer_code', '12345')).toHaveProperty('pattern');
    expect(errorsFor(4012, 'customer_code', '123456789')).toHaveProperty('pattern');
  });
  it('AMOUNT limits follow the recipient / AMOUNT_DIVISOR; lengthMax ignored', () => {
    expect(errorsFor(4427, 'amount', 499)).toHaveProperty('min');
    expect(errorsFor(4427, 'amount', 500)).toBeNull();
    expect(errorsFor(4427, 'amount', 500000)).toBeNull();
    expect(errorsFor(4427, 'amount', 500001)).toHaveProperty('max');
    expect(errorsFor(4012, 'summa', 5_000_000)).toBeNull();
  });
});

describe('field-visibility', () => {
  const soato = field(4012, 'soato');
  const service = field(4012, 'SERVICE_ID');

  it('hides dependents until REGION is set', () => {
    expect(isVisible(soato, { REGION: '' })).toBe(false);
    expect(isVisible(service, {})).toBe(false);
    expect(isVisible(soato, { REGION: '2159' })).toBe(true);
  });
  it('filters options by region', () => {
    expect(filterOptions(soato, { REGION: '2159' })).toHaveLength(22);
    expect(filterOptions(soato, { REGION: '2115' })).toHaveLength(11);
    expect(filterOptions(service, { REGION: '2159' })).toHaveLength(2);
    expect(filterOptions(service, { REGION: '2115' })).toHaveLength(1);
  });
  it('finds dependents recursively', () => {
    const chain: Field[] = [
      { key: 'a' }, { key: 'b', requireField: 'a' }, { key: 'c', requireField: 'b' },
    ] as Field[];
    expect(dependentsOf('a', chain).map((f) => f.key)).toEqual(['b', 'c']);
  });
});

describe('FormBuilderService (Electricity)', () => {
  function build() {
    return TestBed.runInInjectionContext(() =>
      TestBed.inject(FormBuilderService).create(fieldsOf(4012), recipient(4012), TestBed.inject(DestroyRef)),
    );
  }

  it('shows only REGION, customer_code and summa initially, in ord order', () => {
    expect(build().visibleFields().map((f) => f.key)).toEqual(['REGION', 'customer_code', 'summa']);
  });

  it('reveals dependents and resets them when REGION changes', () => {
    const { form, visibleFields, optionsFor } = build();
    form.controls['REGION'].setValue('2159');
    expect(visibleFields().map((f) => f.key)).toEqual(['REGION', 'soato', 'SERVICE_ID', 'customer_code', 'summa']);
    expect(optionsFor('soato')()).toHaveLength(22);

    form.controls['soato'].setValue(optionsFor('soato')()[0].value);
    form.controls['SERVICE_ID'].setValue(optionsFor('SERVICE_ID')()[0].value);
    form.controls['REGION'].setValue('2115');
    expect(form.controls['soato'].value).toBe('');
    expect(optionsFor('soato')()).toHaveLength(11);
  });

  it('auto-selects the only service for Tashkent city (2115)', () => {
    const { form } = build();
    form.controls['REGION'].setValue('2115');
    expect(form.controls['SERVICE_ID'].value).toBe('3014,3013');
  });

  it('excludes hidden controls from form.value', () => {
    const { form } = build();
    expect(Object.keys(form.value).sort()).toEqual(['REGION', 'customer_code', 'summa']);
    expect('soato' in form.value).toBe(false);
    form.controls['REGION'].setValue('2159');
    expect('soato' in form.value).toBe(true);
    form.controls['REGION'].setValue('');
    expect('soato' in form.value).toBe(false);
  });
});
