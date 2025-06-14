import { Component, OnInit, signal } from '@angular/core';
import { CurrentCart } from '@services/cart-service';
import { LineItem } from '@commercetools/platform-sdk';
import { NgForOf } from '@angular/common';
import { CartProductComponent } from '@components/cart-product/cart-product.component';

@Component({
  selector: 'app-cart-page',
  imports: [NgForOf, CartProductComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  public cartItems = signal<LineItem[]>([]);

  public getCartItems(): void {
    this.cartItems.set(CurrentCart.products);
  }

  public ngOnInit(): void {
    this.getCartItems();
  }
}
