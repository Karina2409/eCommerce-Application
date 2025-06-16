import { Component, OnInit, signal } from '@angular/core';
import { CartService, CurrentCart } from '@services/cart-service';
import { LineItem } from '@commercetools/platform-sdk';
import { NgForOf } from '@angular/common';
import { CartProductComponent } from '@components/cart-product';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { CentPrecisionMoney } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-cart-page',
  imports: [NgForOf, CartProductComponent, FormsModule, MatButton],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  public cartItems = signal<LineItem[]>([]);
  public price$!: Observable<CentPrecisionMoney>;
  public totalPrice = signal<number>(0);
  public currentCurrency = signal<string>('USD');

  constructor(private cartService: CartService) {}

  public getCartItems(): void {
    this.cartItems.set(CurrentCart.products);
  }

  public getTotalPrice(): void {
    this.cartService.updateTotalPrice();
    this.price$ = this.cartService.price$;
    this.price$
      .pipe(
        filter((price): price is CentPrecisionMoney => !!price),
        map((price) => ({
          amount: price.centAmount / Math.pow(10, price.fractionDigits),
          currency: price.currencyCode,
        })),
      )
      .subscribe(({ amount, currency }) => {
        this.totalPrice.set(amount);
        this.currentCurrency.set(currency);
      });
  }

  public ngOnInit(): void {
    this.getCartItems();
    this.getTotalPrice();
  }
}
