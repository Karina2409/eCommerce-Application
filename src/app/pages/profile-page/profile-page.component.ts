import { Component, inject, OnInit, signal } from '@angular/core';
import { AddressCardComponent } from '@components/address-card';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import { ProfileService } from '@services/profile-service';
import { Address, AddressResponse } from '@models/types';
import { Customer } from '@commercetools/platform-sdk';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordValidator } from '@validators/password';
import { minAgeValidator } from '@validators/age';
import {
  DateFieldComponent,
  EmailFieldComponent,
  NameFieldComponent,
  PasswordFieldComponent,
} from '@components/input';
import { emailValidator } from '@validators/email';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { latinValidator } from '@validators/latin';

@Component({
  selector: 'app-profile-page',
  imports: [
    AddressCardComponent,
    NgForOf,
    NameFieldComponent,
    DateFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    EmailFieldComponent,
    MatIcon,
    MatTooltip,
    RouterLink,
    PasswordFieldComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  public user!: Customer;
  public addresses!: AddressResponse[];
  public profileService = inject(ProfileService);
  public isInfoEditing = signal(false);
  public isPasswordChanging = signal(false);

  public form: FormGroup = new FormGroup({
    userInfo: new FormGroup({
      firstName: new FormControl('', [Validators.required, latinValidator]),
      lastName: new FormControl('', [Validators.required, latinValidator]),
      dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),
      email: new FormControl('', [Validators.required, emailValidator]),
    }),

    password: new FormGroup({
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator,
      ]),

      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator,
      ]),
    }),

    shippingAddress: new FormGroup({}),
    billingAddress: new FormGroup({}),
  });

  public get userInfoGroup(): FormGroup {
    return this.form.get('userInfo') as FormGroup;
  }

  public get passwordGroup(): FormGroup {
    return this.form.get('password') as FormGroup;
  }

  public get oldPassword(): FormControl {
    return this.passwordGroup.get('oldPassword') as FormControl;
  }

  public get newPassword(): FormControl {
    return this.passwordGroup.get('newPassword') as FormControl;
  }

  public get firstName(): FormControl {
    return this.userInfoGroup.get('firstName') as FormControl;
  }

  public get lastName(): FormControl {
    return this.userInfoGroup.get('lastName') as FormControl;
  }

  public get dateOfBirth(): FormControl {
    return this.userInfoGroup.get('dateOfBirth') as FormControl;
  }

  public get email(): FormControl {
    return this.userInfoGroup.get('email') as FormControl;
  }

  public async ngOnInit() {
    await this.profileService.getCustomerInfo().then((info) => {
      if (info.customer) {
        this.user = info.customer;
        this.addresses = this.setAddresses(info.customer);
        if (this.userInfoGroup) {
          this.userInfoGroup.patchValue({
            firstName: this.user.firstName ?? '',
            lastName: this.user.lastName ?? '',
            dateOfBirth: this.user.dateOfBirth ?? '',
            email: this.user.email ?? '',
          });
        }
      }
    });
  }

  public setAddresses(customer: Customer): AddressResponse[] {
    void this;
    const {
      addresses,
      billingAddressIds,
      shippingAddressIds,
      defaultBillingAddressId,
      defaultShippingAddressId,
    } = customer;
    return addresses.map((address) => ({
      ...address,
      billingAddressIds,
      shippingAddressIds,
      defaultBillingAddressId,
      defaultShippingAddressId,
    }));
  }

  public toggleInfoEdition(): void {
    this.isInfoEditing.update((value) => !value);
  }

  public onSubmitAction(): void {
    if (this.userInfoGroup.valid) {
      if (this.user.lastName === this.lastName.value) {
        this.changeLastName(this.lastName.value);
      }
      if (this.user.firstName === this.firstName.value) {
        this.changeFirstName(this.firstName.value);
      }
      if (this.user.email === this.email.value) {
        this.changeEmail(this.email.value);
      }
      if (this.user.dateOfBirth === this.dateOfBirth.value) {
        this.setDateOfBirth(this.dateOfBirth.value);
      }
    }
    this.isInfoEditing.set(false);
  }

  public async onEditPasswordSubmit(
    oldPassword: FormControl,
    newPassword: FormControl,
  ): Promise<void> {
    if (!this.passwordGroup.valid) return;

    let id = '';
    const data = await this.profileService.getCustomerInfo();
    if (data.customer?.id) {
      id = data.customer.id;
    }
    await this.profileService.updateCustomerPassword({
      id: id,
      version: this.profileService.currentVersion,
      currentPassword: oldPassword.value,
      newPassword: newPassword.value,
    });
    this.togglePasswordEditing();
  }

  public togglePasswordEditing(): void {
    this.isPasswordChanging.update((value) => !value);
    this.passwordGroup.reset();
  }

  public initOldPassword(control: FormControl) {
    this.oldPassword.setValue(control.value);
  }

  public initNewPassword(control: FormControl) {
    this.newPassword.setValue(control.value);
  }

  public async addAddress({ city, country, postalCode, streetName, streetNumber }: Address) {
    void this;
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'addAddress',
          address: {
            streetName,
            streetNumber,
            postalCode,
            city,
            country,
          },
        },
      ],
    });
  }

  public async changeAddress({
    addressId,
    streetName,
    streetNumber,
    postalCode,
    city,
    country,
  }: Address) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'changeAddress',
          addressId,
          address: {
            streetName,
            streetNumber,
            postalCode,
            city,
            country,
          },
        },
      ],
    });
  }

  public async removeAddress(addressId: string) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'removeAddress',
          addressId,
        },
      ],
    });
  }

  public async changeEmail(email: string) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'changeEmail',
          email,
        },
      ],
    });
  }

  public async changeFirstName(firstName: string) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setFirstName',
          firstName,
        },
      ],
    });
  }

  public async changeLastName(lastName: string) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setLastName',
          lastName,
        },
      ],
    });
  }

  //format dateOfBirth: '2015-10-21'
  public async setDateOfBirth(dateOfBirth: string) {
    void this;
    await this.profileService.getCustomerInfo();
    await this.profileService.updateCustomerInfo(this.user.id, {
      version: this.profileService.currentVersion,
      actions: [
        {
          action: 'setDateOfBirth',
          dateOfBirth,
        },
      ],
    });
  }
}
