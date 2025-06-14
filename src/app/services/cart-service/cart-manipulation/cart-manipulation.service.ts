import { Injectable } from '@angular/core';
import { CartService, CurrentCart } from '@services/cart-service';
import { AuthService } from '@services/auth-service';

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
    let id;
    const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id!);
    if (CurrentCart.id && typeof version === 'number') {
      id = CurrentCart.id;
      await cartService.makePurchases(authService.apiRoot, id, version, currentProductId);
    }
    cartService.updateCartProductCount();
  }
}
