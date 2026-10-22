import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { SelectOption } from '../../models/select-option.model';
import { SelectInputComponent } from './select-input.component';

@Component({
  imports: [ReactiveFormsModule, SelectInputComponent],
  template: ` <app-select-input [formControl]="control" [label]="label" [options]="options" /> `,
})
class HostComponent {
  readonly label = 'Region';
  readonly options: SelectOption[] = [
    { value: 'first', label: 'First region' },
    { value: 'second', label: 'Second region' },
  ];
  readonly control = new FormControl<string>('', { nonNullable: true });
}

describe('SelectInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getSelect = async (): Promise<MatSelectHarness> => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    return loader.getHarness(MatSelectHarness);
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('writes the chosen option value to the control', async () => {
    const [, chosen] = host.options;
    const select = await getSelect();

    await select.open();
    await select.clickOptions({ text: chosen.label });

    expect(host.control.value).toBe(chosen.value);
  });

  it('shows the label of the value written by the form', async () => {
    const [chosen] = host.options;

    host.control.setValue(chosen.value);
    const select = await getSelect();

    expect(await select.getValueText()).toBe(chosen.label);
  });

  it('disables the select when the control is disabled', async () => {
    host.control.disable();
    const select = await getSelect();

    expect(await select.isDisabled()).toBe(true);
  });

  it('marks the control touched after the panel closes', async () => {
    const select = await getSelect();

    await select.open();
    await select.close();

    expect(host.control.touched).toBe(true);
  });
});
