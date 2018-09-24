import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FacadeService } from '../../../facade_service/facade.service';
import { StoreService } from '../services/store.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsersService } from '../../home/services/users.service';

import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[credit-card]'
})
export class CreditCardDirective {

  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    let trimmed = input.value.replace(/\s+/g, '');
    if (trimmed.length > 16) {
      trimmed = trimmed.substr(0, 16);
    };

    input.addEventListener('keyup', replaceAndFix);
    input.addEventListener('change', replaceAndFix);
    input.addEventListener('blur', replaceAndFix);

    let numbers = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      numbers.push(trimmed.substr(i, 4));
    };

    input.value = numbers.join(' ');

    function replaceAndFix(e) {
      if (e.target.value.length >= 19) {
        e.preventDefault();
      };
      var currentInput = this.value;
      var fixedInput = currentInput.replace(/[^0-9 \,]/, '');
      this.value = fixedInput;
    };
  };
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  @Output() completeOrder: EventEmitter<any> = new EventEmitter<any>();
  private subscriptions = new Subscription();
  private orderFormGroup: FormGroup;
  private cities: any[];
  private today = new Date();
  private nextMonth = new Date(new Date().getFullYear(), (new Date().getMonth() + 1) % 12 + 1, 0);
  public takenShippingDates: any[] = null;

  constructor(private _formBuilder: FormBuilder,
    private storeService: StoreService,
    public facadeService: FacadeService,
    public userService: UsersService) { }

  ngOnInit() {
    this.buildOrderForm();
    this.getShippingDates();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };

  public getShippingDates() {
    this.subscriptions.add(
      this.storeService.getShippingDates().subscribe(response => {
        if (response.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(response.hasError, 'alert');
        } else {
          /// everything went ok - response is our dates
          this.takenShippingDates = response;
        };
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  public buildOrderForm() {
    this.getCitiesOpt();
    this.orderFormGroup = this._formBuilder.group({
      city: [
        '',
        [
          Validators.required
        ]
      ],
      address: [
        '',
        [
          Validators.required
        ]
      ],
      shipping_date: [
        '',
        [
          Validators.required
        ]
      ],
      credit_card: [
        '',
        [
          Validators.required,
          Validators.minLength(19),
          this.creditCardPattern
        ]
      ],
    });
  };

  public handleOrderSubmit() {
    let ok = true;
    let ccVal = this.orderFormGroup.get('credit_card').value.split(' ').join('');
    ccVal = ccVal.length === 17 ? ccVal.slice(0, -1) : ccVal.length === 16 ? ccVal : ok = false;
    if (ok && this.orderFormGroup.valid && this.dateIsValid()) {
      // after validation
      let orderDetailsMissingCartAndTotal = {
        user: this.facadeService.user._id,
        city: this.orderFormGroup.value.city,
        address: this.orderFormGroup.value.address,
        shippingDate: this.orderFormGroup.value.shipping_date,
        last4Digits: ccVal.substr(ccVal.length - 4),
        updatedAt: new Date()
      };
      this.completeOrder.emit(orderDetailsMissingCartAndTotal);
    };
  };

  public getCitiesOpt() {
    this.subscriptions.add(this.userService.getCitiesJSON().subscribe(citiesJSON => { this.cities = citiesJSON; }));
  };

  public checkUserDataIn() {
    let currentCity = this.orderFormGroup.value.city;
    let currentAddress = this.orderFormGroup.value.address;
    return (
      this.facadeService.user ?
        this.facadeService.user.city == currentCity &&
        this.facadeService.user.address == currentAddress : true);
  };

  public fillAutoUserFields() {
    this.orderFormGroup.get('address').setValue(this.facadeService.user.address);
    this.orderFormGroup.get('city').setValue(this.facadeService.user.city);
  };

  public dateFilter() {
    if (this.takenShippingDates !== null) {
      // dates should not be taken.
      let disabledDates = this.prepareDates();
      return (date: Date) => {
        for (let i = 0; i < disabledDates.length; i++) {
          let disabled = disabledDates[i];
          if (date.getFullYear() == disabled[0] &&
            date.getMonth() % 12 + 1 == disabled[1] &&
            date.getDate() == disabled[2]) {
            return false;
          };
        };
        return true;
      };
    };
  };

  public prepareDates(): number[] {
    let gotShipping = this.takenShippingDates;
    let disabledDates = [];
    for (let i = 0; i < gotShipping.length; i++) {
      let added = false;
      let counter = 0;
      const date = gotShipping[i];
      for (let j = 0; j < gotShipping.length; j++) {
        const dateB = gotShipping[j];
        if (dateB[0] == date[0] &&
          dateB[1] == date[1] &&
          dateB[2] == date[2]) {
          counter++;
        };
        // check if already there
        for (let k = 0; k < disabledDates.length; k++) {
          const existDate = disabledDates[k];
          if (date[0] == existDate[0] &&
            date[1] == existDate[1] &&
            date[2] == existDate[2]) {
            added = true;
          };
        };
      };
      if (counter >= 3 && !added) {
        disabledDates.push(date);
      };
    };
    return disabledDates;
  };

  public preventWrongValues() {
    let ccVal = this.orderFormGroup.value.credit_card;
    if (ccVal === null)
      this.orderFormGroup.get('credit_card').setValue(null);
  };

  public preventWrongKeys(e) {
    let invalidChars = ["-", "+", "e"];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    };
  };

  public creditCardPattern(control: AbstractControl) {
    if (control.value.length == 19) {
      if (control.value !== null && control.value.search(/^\d+$/)) {
        return null;
      } else {
        return { hasError: `Wrong Format` };
      };
    };
    return null;
  };

  public dateIsValid() {
    let disabledDates = this.prepareDates();
    let date = new Date(this.orderFormGroup.get('shipping_date').value);
    for (let i = 0; i < disabledDates.length; i++) {
      const disabledDate = disabledDates[i];
      if (date[0] == disabledDate[0] &&
        date[1] == disabledDate[1] &&
        date[2] == disabledDate[2]) {
        this.facadeService.openSnackBar(`Date Is Already Taken, please choose a new one.`, 'alert');
        return false;
      };
    };
    return true;
  };

}
