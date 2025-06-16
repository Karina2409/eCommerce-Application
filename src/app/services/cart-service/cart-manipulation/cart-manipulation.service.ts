import { Injectable } from '@angular/core';
import { CartService, CurrentCart } from '@services/cart-service';
import { AuthService } from '@services/auth-service';
import { LineItem } from '@commercetools/platform-sdk';

@Injectable({
  providedIn: 'root',
})
export class CartManipulationService {
  public async addProduct(
    cartService: CartService,
    authService: AuthService,
    currentProductId: string,
  ) {
    void this;
    const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id!);
    if (CurrentCart.id && typeof version === 'number') {
      const id = CurrentCart.id;
      await cartService.makePurchases(authService.apiRoot, id, version, currentProductId);
    }
    cartService.updateCartProductCount();
  }
  public async removeProduct(
    cartService: CartService,
    authService: AuthService,
    lineItemId: string,
    quantity?: number,
  ): Promise<void> {
    void this;
    const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id!);
    if (CurrentCart.id && typeof version === 'number') {
      const id = CurrentCart.id;
      await cartService.removePurchases(authService.apiRoot, id, version, lineItemId, quantity);
    }
    cartService.updateCartProductCount();
  }

  public async removeAllProducts(
    cartService: CartService,
    authService: AuthService,
    purchases: LineItem[],
  ): Promise<void> {
    void this;
    for (const purchase of purchases) {
      await this.removeProduct(cartService, authService, purchase.id, purchase.quantity);
    }
    cartService.updateProducts();
    cartService.updateTotalPrice();
  }
}
