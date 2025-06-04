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
}
