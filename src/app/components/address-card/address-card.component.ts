import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AddressResponse } from '@models/types';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-address-card',
  imports: [MatIcon, MatTooltip],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss',
})
export class AddressCardComponent implements OnInit {
  @Input() public address!: AddressResponse;
  @Output() public removeAddress = new EventEmitter<string>();

  public addressId = '';

  public get isBilling(): boolean {
    return this.address.billingAddressIds?.includes(this.addressId) ?? false;
  }

  public get isShipping(): boolean {
    return this.address.shippingAddressIds?.includes(this.addressId) ?? false;
  }

  public get isDefaultBilling(): boolean {
    return this.address.defaultBillingAddressId?.includes(this.addressId) ?? false;
  }

  public get isDefaultShipping(): boolean {
    return this.address.defaultShippingAddressId?.includes(this.addressId) ?? false;
  }

  public ngOnInit() {
    this.addressId = this.address.id ?? '';
  }

  public onRemoveAddress() {
    this.removeAddress.emit(this.addressId);
  }
}
