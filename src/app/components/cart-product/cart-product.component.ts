import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { LineItem, ProductVariant } from '@commercetools/platform-sdk';
import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { ProductDetailService } from '@services/product-detail-service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { AuthService } from '@services/auth-service';
import { CartManipulationService, CartService } from '@services/cart-service';
@Component({
  selector: 'app-cart-product',
  imports: [MatCardImage, MatCard, MatCardContent, NgIf, MatIconButton, MatIcon, MatDivider],
  templateUrl: './cart-product.component.html',
  styleUrl: './cart-product.component.scss',
})
export class CartProductComponent implements OnInit {
  @Output() public myOutput = new EventEmitter<string>();
  @Input() public cartItem!: LineItem;
  public variant: ProductVariant | undefined;
  public price: string | null = null;
  public priceAmount: number | null = null;
  public priceCurrency: string | null = null;
  public discountedPrice: number | undefined;
  public quantity: number | null = null;
  public productDetailService: ProductDetailService = inject(ProductDetailService);
  public isInCart = signal<boolean>(false);
  protected authService: AuthService = inject(AuthService);
  protected cartService: CartService = inject(CartService);
  protected cartManipulation: CartManipulationService = inject(CartManipulationService);

  public async increaseQuantity() {
    await this.cartManipulation.addProduct(
      this.cartService,
      this.authService,
      this.cartItem.productId,
    );
    this.cartService.updateTotalPrice();
    this.myOutput.emit();
  }

  public async decreaseQuantity() {
    await this.cartManipulation.removeProduct(this.cartService, this.authService, this.cartItem.id);
    this.cartService.updateTotalPrice();
    this.myOutput.emit();
  }

  public async removeProduct() {
    await this.cartManipulation.removeProduct(
      this.cartService,
      this.authService,
      this.cartItem.id,
      this.cartItem.quantity,
    );
    this.cartService.updateTotalPrice();
    this.myOutput.emit();
  }

  public ngOnInit() {
    if (!this.cartItem) {
      throw new Error('cartItem is required');
    }
    if (this.cartItem) this.updateProductDetail();
  }

  public updateProductDetail() {
    this.variant = this.cartItem.variant;
    this.price = this.productDetailService.getAttribute(this.variant, 'price');
    const salePrice = this.productDetailService.getDiscountedPrice(this.variant);
    if (salePrice) this.discountedPrice = parseFloat(salePrice);
    this.quantity = this.cartItem.quantity;
    if (this.price) {
      const [amount, currency] = this.price.split(' ');
      this.priceAmount = parseFloat(amount);
      this.priceCurrency = currency;
    }
  }
}
