import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Countries } from '@models/enums';
import { signal } from '@angular/core';
import { AuthService } from '@services/auth-service';
import { CustomerDraft } from '@models/types';
import { emailValidator } from '@validators/email';
import { passwordValidator } from '@validators/password';

@Component({
  selector: 'app-registration-page',
  imports: [MatButton, NgIf, ReactiveFormsModule, RouterLink, NgForOf, KeyValuePipe],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public maxDate: string;

  public router = inject(Router);
  public errorMessage = signal('');
  public isPasswordShown = signal(false);
  public isShippingAddressDefault = signal(false);
  public isBillingAddressDefault = signal(false);
  public isShippingBillingAddressDefault = signal(false);
  public isBillingShippingAddressDefault = signal(false);

  public customer: CustomerDraft = {
    email: '',
    addresses: [],
    billingAddresses: [],
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    password: '',
    shippingAddresses: [],
  };

  public form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      passwordValidator,
    ]),
    firstName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
    lastName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
    dateOfBirth: new FormControl('', [Validators.required]),
    shippingAddress: new FormGroup({
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
      shippingDefault: new FormControl(''),
      shippingBillingDefault: new FormControl(''),
    }),
    billingAddress: new FormGroup({
      country: new FormControl('', [Validators.required]),
      streetName: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{5}(-\d{4})?$|^\d{6}$/),
      ]),
      billingDefault: new FormControl(''),
      billingShippingDefault: new FormControl(''),
    }),
  });

  protected readonly countries = Countries;

  constructor(private authService: AuthService) {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    this.maxDate = thirteenYearsAgo.toISOString().split('T')[0];
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get email() {
    return this.form.get('email');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get password() {
    return this.form.get('password');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get firstName() {
    return this.form.get('firstName');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get lastName() {
    return this.form.get('lastName');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get dateOfBirth() {
    return this.form.get('dateOfBirth');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get shippingCountry() {
    return this.form.get('shippingAddress')?.get('country');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get shippingCity() {
    return this.form.get('shippingAddress')?.get('city');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get shippingStreet() {
    return this.form.get('shippingAddress')?.get('streetName');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get shippingCode() {
    return this.form.get('shippingAddress')?.get('postalCode');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get billingCountry() {
    return this.form.get('billingAddress')?.get('country');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get billingCity() {
    return this.form.get('billingAddress')?.get('city');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get billingStreet() {
    return this.form.get('billingAddress')?.get('streetName');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get billingCode() {
    return this.form.get('billingAddress')?.get('postalCode');
  }

  public onSubmitAction(): void {
    if (this.form.valid) {
      this.customer = this.form.value;
      const shippingAddress = this.form.value.shippingAddress;
      const billingAddress = this.form.value.billingAddress;
      const addresses = [];
      if (shippingAddress) {
        addresses.push(shippingAddress);
      }
      if (billingAddress) {
        addresses.push(billingAddress);
      }
      this.authService
        .signUp({
          ...this.customer,
          addresses: addresses,
          billingAddresses: [],
          shippingAddresses: [],
        })
        .then((loginResponse) => {
          if (loginResponse instanceof Object && loginResponse.result === true) {
            this.authService
              .signIn(this.form.value.email, this.form.value.password)
              .then((loginResponse) => {
                if (loginResponse instanceof Object && loginResponse.result === true) {
                  this.router.navigate(['main']);
                } else if (typeof loginResponse === 'string') {
                  this.errorMessage.set(loginResponse);
                }
              });
          } else if (typeof loginResponse === 'string') {
            this.errorMessage.set(loginResponse);
          }
        });
    }
  }

  public togglePassword(): void {
    this.isPasswordShown.update((value) => !value);
  }

  public toggleBillingAddressDefault(): void {
    this.isBillingAddressDefault.update((value) => !value);
  }

  public toggleShippingAddressDefault(): void {
    this.isShippingAddressDefault.update((value) => !value);
  }

  public toggleShippingBillingAddressDefault(): void {
    this.isShippingBillingAddressDefault.update((value) => !value);
    if (this.isShippingBillingAddressDefault()) {
      this.form.get('billingAddress')?.disable();
    } else {
      this.form.get('billingAddress')?.enable();
    }
  }

  public toggleBillingShippingAddressDefault(): void {
    this.isBillingShippingAddressDefault.update((value) => !value);
    if (this.isBillingShippingAddressDefault()) {
      this.form.get('shippingAddress')?.disable();
    } else {
      this.form.get('shippingAddress')?.enable();
    }
  }
}
