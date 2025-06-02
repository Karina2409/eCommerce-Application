import { Component, Input } from '@angular/core';
import { AddressResponse } from '@models/types';

@Component({
  selector: 'app-address-card',
  imports: [],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss',
})
export class AddressCardComponent {
  @Input() public address!: AddressResponse;
  // public get isBilling(): boolean {
  //   return this.address.type === 'billing';
  // }
  //
  // public get isShipping(): boolean {
  //   return this.address.type === 'shipping';
  // }
  //
  // public get isDefault(): boolean {
  //   return this.address.isDefault;
  // }
}
