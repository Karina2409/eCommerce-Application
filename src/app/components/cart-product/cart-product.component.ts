import { Component, inject, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { LineItem, ProductVariant } from '@commercetools/platform-sdk';
import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { ProductDetailService } from '@services/product-detail-service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
@Component({
  selector: 'app-cart-product',
  imports: [MatCardImage, MatCard, MatCardContent, NgIf, MatIconButton, MatIcon, MatDivider],
  templateUrl: './cart-product.component.html',
  styleUrl: './cart-product.component.scss',
})
export class CartProductComponent implements OnInit {
  @Input() public cartItem!: LineItem;
  public variant: ProductVariant | undefined;
  public price: string | null = null;
  public discountedPrice: string | undefined;
  public quantity: number | null = null;
  public productDetailService: ProductDetailService = inject(ProductDetailService);

  // public increaseQuantity() {}

  // public decreaseQuantity() {}

  public ngOnInit() {
    this.variant = this.cartItem.variant;
    this.price = this.productDetailService.getAttribute(this.variant, 'price');
    this.discountedPrice = this.productDetailService.getDiscountedPrice(this.variant);
    this.quantity = this.cartItem.quantity;
  }
}
