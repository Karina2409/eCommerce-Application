import { Component, inject, WritableSignal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '@services/auth-service';
import { CustomerDraft } from '@models/types';
import { emailValidator } from '@validators/email';
import { passwordValidator } from '@validators/password';
import { minAgeValidator } from '@validators/age';
import { AddressComponent } from '@components/address-form';
import {
  DateFieldComponent,
  EmailFieldComponent,
  NameFieldComponent,
  PasswordFieldComponent,
} from '@components/input';
import { latinValidator } from '@validators/latin';
import { Address, Customer } from '@commercetools/platform-sdk';
import { ProfileService } from '@services/profile-service';

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
    PasswordFieldComponent,
    DateFieldComponent,
    CommonModule,
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss',
})
export class RegistrationPageComponent {
  public shippingAddressFormGroup!: FormGroup;
  public billingAddressFormGroup!: FormGroup;

  public router = inject(Router);
  public readonly errorMessage = signal('');
  public readonly isShippingAddressDefault = signal(false);
  public readonly isBillingAddressDefault = signal(false);
  public readonly isShippingBillingAddressDefault = signal(false);
  public readonly isBillingShippingAddressDefault = signal(false);
  public user!: Customer;

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
    firstName: new FormControl('', [Validators.required, latinValidator]),
    lastName: new FormControl('', [Validators.required, latinValidator]),
    dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),

    shippingAddress: new FormGroup({}),
    billingAddress: new FormGroup({}),
  });

  protected readonly signal = signal;

  private authService: AuthService = inject(AuthService);
  private profileService: ProfileService = inject(ProfileService);

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

  public get dateOfBirth(): FormControl {
    return this.form.get('dateOfBirth') as FormControl;
  }

  public onShippingAddressInit(addressForm: FormGroup) {
    this.shippingAddressFormGroup = addressForm;
    this.form.setControl('shippingAddress', this.shippingAddressFormGroup);
  }

  public onBillingAddressInit(addressForm: FormGroup) {
    this.billingAddressFormGroup = addressForm;
    this.form.setControl('billingAddress', this.billingAddressFormGroup);
  }

  public async onSubmitAction(): Promise<void> {
    if (!this.form.valid) return;

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

    try {
      const signUpResult = await this.authService.signUp({
        ...this.customer,
        addresses: addresses,
        billingAddresses: [],
        shippingAddresses: [],
      });

      if (typeof signUpResult === 'string') {
        this.errorMessage.set(signUpResult);
        return;
      }

      if (signUpResult.result) {
        const signInResult = await this.authService.signIn(
          this.form.value.email,
          this.form.value.password,
        );

        if (typeof signInResult === 'string') {
          this.errorMessage.set(signInResult);
          return;
        }

        if (signInResult.result) {
          if (signUpResult.customer?.addresses) {
            await this.setDefaultAddresses(signUpResult.customer.addresses);
          }
          await this.router.navigate(['main']);
        }
      }
    } catch (error) {
      this.errorMessage.set((error as Error).message || 'Unexpected error');
    }
  }

  public async setDefaultAddresses(addresses: Address[]) {
    await this.profileService.getCustomerInfo().then((info) => {
      this.user = info.customer!;
    });

    const shippingDefault = this.isShippingAddressDefault();
    const billingDefault = this.isBillingAddressDefault();
    const bothDefault =
      this.isShippingBillingAddressDefault() || this.isBillingShippingAddressDefault();

    const shippingAddressId = addresses[0]?.id;
    const billingAddressId = addresses[1]?.id;

    if (bothDefault && shippingAddressId) {
      await this.setDefaultShippingAddress(shippingAddressId);
      await this.setDefaultBillingAddress(shippingAddressId);
      await this.addShippingAddressID(shippingAddressId);
      await this.addBillingAddressID(shippingAddressId);
    } else if (bothDefault && billingAddressId) {
      await this.setDefaultShippingAddress(billingAddressId);
      await this.setDefaultBillingAddress(billingAddressId);
      await this.addShippingAddressID(billingAddressId);
      await this.addBillingAddressID(billingAddressId);
    } else {
      if (shippingAddressId) {
        await this.addShippingAddressID(shippingAddressId);
        if (shippingDefault) {
          await this.setDefaultShippingAddress(shippingAddressId);
        }
      } else if (billingAddressId) {
        await this.addBillingAddressID(billingAddressId);
        if (billingDefault) {
          await this.setDefaultBillingAddress(billingAddressId);
        }
      }
    }
  }

  public async setDefaultShippingAddress(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDefaultShippingAddress',
          addressId,
        },
      ],
    });
  }

  public async addShippingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addShippingAddressId',
          addressId,
        },
      ],
    });
  }

  public async setDefaultBillingAddress(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDefaultBillingAddress',
          addressId,
        },
      ],
    });
  }

  public async addBillingAddressID(addressId: string) {
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addBillingAddressId',
          addressId,
        },
      ],
    });
  }

  public toggleAddress(event: { signal: WritableSignal<boolean>; value?: string }): void {
    const { signal, value } = event;

    signal.update((val) => !val);
    if (value) {
      const controlName = value === 'billingAddress' ? 'shippingAddress' : 'billingAddress';
      const control = this.form.get(controlName);
      if (!control) return;
      if (signal()) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }
}
