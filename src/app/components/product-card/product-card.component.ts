import { Component, Input, Signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import { ProductProjection } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-product-card',
  imports: [MatButton, NgForOf],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) public products!: Signal<ProductProjection[]>;
}
