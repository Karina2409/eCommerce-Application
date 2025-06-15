import { Component, OnInit, signal } from '@angular/core';
import { CurrentCart } from '@services/cart-service';
import { LineItem } from '@commercetools/platform-sdk';
import { NgForOf } from '@angular/common';
import { CartProductComponent } from '@components/cart-product';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-cart-page',
  imports: [NgForOf, CartProductComponent, FormsModule, MatButton],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  public cartItems = signal<LineItem[]>([]);
  public totalPrice = signal<number>(0);
  public currentCurrency = signal<string>('USD');

  public getCartItems(): void {
    this.cartItems.set(CurrentCart.products);
  }

  public getTotalPrice(): void {
    const price = CurrentCart.cart?.totalPrice;
    if (price) {
      const amount = price.centAmount / Math.pow(10, price.fractionDigits);
      this.totalPrice.set(amount);
      this.currentCurrency.set(price.currencyCode);
    }
  }

  public ngOnInit(): void {
    this.getCartItems();
    this.getTotalPrice();
  }
}
