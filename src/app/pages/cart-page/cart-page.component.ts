import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CartManipulationService, CartService } from '@services/cart-service';
import { LineItem } from '@commercetools/platform-sdk';
import { NgForOf, NgIf } from '@angular/common';
import { CartProductComponent } from '@components/cart-product';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { CentPrecisionMoney } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { filter, map, Observable } from 'rxjs';
import { AuthService } from '@services/auth-service';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cart-page',
  imports: [
    NgForOf,
    CartProductComponent,
    FormsModule,
    MatButton,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  public products$!: Observable<LineItem[]>;
  public promoCode = signal<string>('');
  public cartItems = signal<LineItem[]>([]);
  public price$!: Observable<CentPrecisionMoney>;
  public totalPrice = signal<number>(0);
  public prevPrice = signal<number>(0);
  public currentCurrency = signal<string>('USD');
  public promoInput: FormGroup = new FormGroup({
    codeInput: new FormControl('', [Validators.required]),
  });
  protected cartManipulation: CartManipulationService = inject(CartManipulationService);
  protected authService: AuthService = inject(AuthService);
  protected cartService: CartService = inject(CartService);

  constructor(private destroyRef: DestroyRef) {}

  public codeFromInput(): void {
    const code: string | null = this.promoInput.get('codeInput')?.value;
    if (typeof code === 'string') this.promoCode.set(code);
  }

  public getCartItems(): void {
    this.cartService.updateProducts();
    this.products$ = this.cartService.products$;
    this.products$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((products) => {
      this.cartItems.set(products);
    });
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
        takeUntilDestroyed(this.destroyRef),
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

  public setPrevPrice(): void {
    this.prevPrice.set(this.totalPrice());
  }

  public clearPrevPrice(): void {
    this.prevPrice.set(0);
  }

  public onSubmit(): void {
    this.codeFromInput();
    this.cartManipulation
      .applyDiscountCode(this.cartService, this.authService, this.promoCode())
      .then(() => this.setPrevPrice());
  }

  public onClear(): void {
    this.cartManipulation.removeDiscountCode(this.cartService, this.authService, this.promoCode());
    this.cartManipulation.removeAllProducts(this.cartService, this.authService, this.cartItems());
    this.clearPrevPrice();
  }
}
