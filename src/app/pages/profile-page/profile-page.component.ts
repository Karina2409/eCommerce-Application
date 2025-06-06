import { Component, inject, OnInit, signal } from '@angular/core';
import { AddressCardComponent } from '@components/address-card';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import { ProfileService } from '@services/profile-service';
import { AddressResponse } from '@models/types';
import { Customer } from '@commercetools/platform-sdk';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordValidator } from '@validators/password';
import { minAgeValidator } from '@validators/age';
import { DateFieldComponent, NameFieldComponent } from '@components/input';

@Component({
  selector: 'app-profile-page',
  imports: [
    AddressCardComponent,
    NgForOf,
    NameFieldComponent,
    DateFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  public user!: Customer;
  public addresses!: AddressResponse[];
  public profileService = inject(ProfileService);
  public isInfoEditing = signal(false);

  public form: FormGroup = new FormGroup({
    userInfo: new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]),
      dateOfBirth: new FormControl('', [Validators.required, minAgeValidator(13)]),
    }),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      passwordValidator,
    ]),

    shippingAddress: new FormGroup({}),
    billingAddress: new FormGroup({}),
  });

  public get userInfoGroup(): FormGroup {
    return this.form.get('userInfo') as FormGroup;
  }

  public get password(): FormControl {
    return this.form.get('password') as FormControl;
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

  public async ngOnInit() {
    await this.profileService.getCustomerInfo().then((info) => {
      if (info.customer) {
        this.user = info.customer;
        this.addresses = this.setAddresses(info.customer);
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

  public toggleEdition(): void {
    this.isInfoEditing.update((value) => !value);
  }

  public onSubmitAction(): void {
    if (this.userInfoGroup.valid) {
      this.changeLastName(this.lastName.value);
      this.changeFirstName(this.firstName.value);
      this.setDateOfBirth(this.dateOfBirth.value);
    }
    this.isInfoEditing.set(false);
  }

  public async addAddress(
    streetName: string,
    streetNumber: string,
    postalCode: string,
    city: string,
    country: string,
  ) {
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

  public async changeAddress(
    addressId: string,
    streetName: string,
    streetNumber: string,
    postalCode: string,
    city: string,
    country: string,
  ) {
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
