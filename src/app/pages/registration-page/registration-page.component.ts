import { Component, inject, WritableSignal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signal, OnInit } from '@angular/core';
import { AuthService } from '@services/auth-service';
import { CustomerDraft } from '@models/types';
import { emailValidator } from '@validators/email';
import { passwordValidator } from '@validators/password';
import { minAgeValidator } from '@validators/age';
import { AddressComponent } from '@components/address-form';
import { EmailFieldComponent, NameFieldComponent } from '@components/input';

@Component({
  selector: 'app-registration-page',
  imports: [
    MatButton,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    AddressComponent,
    NameFieldComponent,
    EmailFieldComponent,
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent implements OnInit {
  public shippingAddressFormGroup!: FormGroup;
  public billingAddressFormGroup!: FormGroup;

  public maxDate = '';

  public router = inject(Router);
  public readonly errorMessage = signal('');
  public readonly isPasswordShown = signal(false);
  public readonly isShippingAddressDefault = signal(false);
  public readonly isBillingAddressDefault = signal(false);
  public readonly isShippingBillingAddressDefault = signal(false);
  public readonly isBillingShippingAddressDefault = signal(false);

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
    dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),

    shippingAddress: new FormGroup({}),
    billingAddress: new FormGroup({}),
  });

  private authService: AuthService = inject(AuthService);

  public get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  public get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  public get firstName(): FormControl {
    return this.form.get('firstName') as FormControl;
  }

  public get lastName(): FormControl {
    return this.form.get('lastName') as FormControl;
  }

  public get dateOfBirth() {
    return this.form.get('dateOfBirth');
  }

  public ngOnInit(): void {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    this.maxDate = thirteenYearsAgo.toISOString().split('T')[0];
  }

  public onShippingAddressInit(addressForm: FormGroup) {
    this.shippingAddressFormGroup = addressForm;
    this.form.setControl('shippingAddress', this.shippingAddressFormGroup);
  }

  public onBillingAddressInit(addressForm: FormGroup) {
    this.billingAddressFormGroup = addressForm;
    this.form.setControl('billingAddress', this.billingAddressFormGroup);
  }

  public onSubmitAction(): void {
    if (this.form.valid) {
      this.customer = this.form.value;

      const shippingAddress = this.form.get('shippingAddress')?.value;
      const billingAddress = this.form.get('billingAddress')?.value;

      const addresses = [];

      if (shippingAddress && shippingAddress.country) {
        addresses[0] = shippingAddress;
      }
      if (billingAddress && billingAddress.country) {
        addresses[1] = billingAddress;
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

  public toggleAddress(flag: WritableSignal<boolean>, controlPathToToggle?: string): void {
    flag.update((value) => !value);

    if (controlPathToToggle) {
      const control = this.form.get(controlPathToToggle);
      if (!control) return;
      if (flag()) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }
}
