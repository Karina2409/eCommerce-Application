import { Component, EventEmitter, Input, Output, WritableSignal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Countries } from '@models/enums';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  @Output() public addressChange = new EventEmitter<FormGroup>();

  @Input() public isAddressDefault!: WritableSignal<boolean>;
  @Input() public isBothAddressDefault!: WritableSignal<boolean>;
  @Input() public addressDefaultInput!: string;

  @Output() public toggleAddress = new EventEmitter<{
    signal: WritableSignal<boolean>;
    value?: string;
  }>();

  public addressForm: FormGroup = new FormGroup({
    country: new FormControl('', [Validators.required]),
    streetName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~\s]+$/),
    ]),
    city: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
    postalCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{5}(-\d{4})?$|^\d{6}$/),
    ]),
    addressDefault: new FormControl(''),
    bothAddressesDefault: new FormControl(''),
  });

  protected readonly countries = Countries;

  public get addressDefault(): string {
    return `${this.addressDefaultInput}Address`;
  }

  public get country() {
    return this.addressForm.get('country');
  }

  public get city() {
    return this.addressForm.get('city');
  }

  public get street() {
    return this.addressForm.get('streetName');
  }

  public get code() {
    return this.addressForm.get('postalCode');
  }

  public ngOnInit() {
    this.addressChange.emit(this.addressForm);
  }

  public onToggleAddress(isAddressDefault: WritableSignal<boolean>, addressDefault = '') {
    this.toggleAddress.emit({ signal: isAddressDefault, value: addressDefault || undefined });
  }
}
