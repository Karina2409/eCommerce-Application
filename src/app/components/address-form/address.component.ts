import {
  Component,
  EventEmitter,
  Input,
  Output,
  WritableSignal,
  OnInit,
  signal,
  Signal,
  effect,
  runInInjectionContext,
  inject,
  EnvironmentInjector,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Countries } from '@models/enums';
import { CommonModule } from '@angular/common';
import { AddressResponse } from '@models/types';
import { postalCodeValidator } from '@validators/postal_code';

@Component({
  selector: 'app-address-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  @Output() public addressChange = new EventEmitter<FormGroup>();

  @Input() public isAddressDefault: WritableSignal<boolean> = signal(false);
  @Input() public isBothAddressDefault: WritableSignal<boolean> = signal(false);
  @Input() public addressDefaultInput!: string;
  @Input() public editAddress!: Signal<AddressResponse | null>;

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
    postalCode: new FormControl('', [Validators.required, postalCodeValidator]),
    addressDefault: new FormControl(''),
    bothAddressesDefault: new FormControl(''),
  });

  protected readonly countries = Countries;

  private environmentInjector = inject(EnvironmentInjector);

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
    this.isBothAddressDefault.set(false);
    this.isAddressDefault.set(false);
    this.addressChange.emit(this.addressForm);
    runInInjectionContext(this.environmentInjector, () => {
      effect(() => {
        const address = this.editAddress();

        if (!address) {
          this.addressForm.reset();
          this.isAddressDefault.set(false);
          this.isBothAddressDefault.set(false);
          return;
        }

        this.addressForm.patchValue({
          country: address.country,
          streetName: address.streetName,
          city: address.city,
          postalCode: address.postalCode,
        });

        const isBothDefault =
          address.defaultBillingAddressId === address.id &&
          address.defaultShippingAddressId === address.id;

        let isDefault = false;
        if (address.billingAddressIds?.some((id) => id === address.id)) {
          isDefault = address.defaultBillingAddressId === address.id;
        } else if (address.shippingAddressIds?.some((id) => id === address.id)) {
          isDefault = address.defaultShippingAddressId === address.id;
        }

        this.isBothAddressDefault.set(isBothDefault);
        this.isAddressDefault.set(isDefault);
      });
    });
  }

  public onToggleAddress(isAddressDefault: WritableSignal<boolean>, addressDefault = '') {
    this.toggleAddress.emit({ signal: isAddressDefault, value: addressDefault || undefined });
  }
}
