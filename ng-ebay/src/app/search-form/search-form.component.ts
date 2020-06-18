import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ValidatorFn, AbstractControl, ValidationErrors, } from '@angular/forms'
import { SelectionModel } from '@angular/cdk/collections';
import { isNumber, isNullOrUndefined } from 'util';

interface OrderItem {
  name: string;
  value: Number;
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchFormComponent),
    multi: true
  }]
})
export class SearchFormComponent implements ControlValueAccessor {

  formGroup: FormGroup;
  conditionSelection: SelectionModel<string>;
  shippingSelection: SelectionModel<string>;
  returnAccepted: boolean = false;
  readonly orders: Array<OrderItem> = [{
    name:
      'BestMatch', value: 0
  },
  {
    name:
      'CurrentPriceHighest', value: 1
  },
  {
    name:
      'PricePlusShippingHighest', value: 2
  },
  {
    name:
      'PricePlusShippingLowest', value: 3
  }
  ];
  propagateChange = (_: any) => { };

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      keywords: formBuilder.control(null),
      minimumprice: formBuilder.control(null, this.minimumValidator()),
      maximumprice: formBuilder.control(null, this.maximumValidator()),
      sortby: formBuilder.control(0)
    })
    this.conditionSelection = new SelectionModel<string>(true);
    this.shippingSelection = new SelectionModel<string>(true);
  }

  writeValue(value: any) {
    console.log(value);
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched() { }

  onConditionCheckChange(checkFor: string) {
    this.conditionSelection.toggle(checkFor);
  }

  onShippingCheckChange(checkFor: string) {
    this.shippingSelection.toggle(checkFor);
  }

  onSubmitForm() {
    const formValue = {
      ...this.formGroup.value,
      ...this.conditionSelection.selected.map((select: string) => {
        const item = {}
        item[select] = 'on';
        return item
      }),
      ...this.shippingSelection.selected.map((select: string) => {
        const item = {}
        item[select] = 'on';
        return item
      }),
    }
    this.propagateChange(formValue);
  }

  onResetForm() {
    this.formGroup.reset();
    this.formGroup.get('sortby').setValue(0);
    this.conditionSelection.clear();
    this.shippingSelection.clear();
    this.returnAccepted = false;
  }

  minimumValidator(): ValidatorFn {
    return (currentControl: AbstractControl): ValidationErrors | null => {
      return isNumber(currentControl.value) && currentControl.value < 0 ? { 'numberValidator': 'Under zero' } : null;
    }
  }

  maximumValidator(): ValidatorFn {
    return (currentControl: AbstractControl): ValidationErrors | null => {
      return isNumber(currentControl.value) && currentControl.value < this?.formGroup?.get('minimum').value ? { 'numberValidator': 'Less than minimum' } : null;
    }
  }
}
