import { Component, inject, OnInit, signal } from '@angular/core';
import { AddressCardComponent } from '@components/address-card';
import { NgForOf } from '@angular/common';
import { ProfileService } from '@services/profile-service';
import { AddressResponse } from '@models/types';
import { Customer } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-profile-page',
  imports: [AddressCardComponent, NgForOf],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  public user!: Customer;
  public addresses!: AddressResponse[];
  public profileService = inject(ProfileService);
  public isInfoEditing = signal(false);

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
