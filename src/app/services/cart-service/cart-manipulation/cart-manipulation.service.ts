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
    if (CurrentCart.id) {
      const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id);
      if (typeof version === 'number') {
        const id = CurrentCart.id;
        await cartService.makePurchases(authService.apiRoot, id, version, currentProductId);
      }
      cartService.updateCartProductCount();
    }
  }
  public async removeProduct(
    cartService: CartService,
    authService: AuthService,
    lineItemId: string,
    quantity?: number,
  ): Promise<void> {
    void this;
    if (CurrentCart.id) {
      const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id);
      if (typeof version === 'number') {
        const id = CurrentCart.id;
        await cartService.removePurchases(authService.apiRoot, id, version, lineItemId, quantity);
      }
      cartService.updateCartProductCount();
    }
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

  public async removeProductByProductID(
    productID: string,
    cartService: CartService,
    authService: AuthService,
  ) {
    const lineId = CurrentCart.getLineItemIdByProductId(productID);
    await this.removeProduct(cartService, authService, lineId);
  }

  public async applyDiscountCode(
    cartService: CartService,
    authService: AuthService,
    discountCode: string,
  ) {
    void this;
    if (CurrentCart.id) {
      const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id);
      if (typeof version === 'number') {
        await cartService.applyDiscountCode(
          authService.apiRoot,
          CurrentCart.id!,
          version,
          discountCode,
        );
        cartService.updateTotalPrice();
      }
    }
  }

  public async removeDiscountCode(
    cartService: CartService,
    authService: AuthService,
    discountCode: string,
  ) {
    void this;
    if (CurrentCart.id) {
      const version = await cartService.currentVersionCart(authService.apiRoot, CurrentCart.id);
      const discountCodeResponse = await authService.apiRoot
        .discountCodes()
        .get({ queryArgs: { where: `code="${discountCode}"` } })
        .execute();
      const discountCodeId = discountCodeResponse.body.results[0].id;
      if (typeof version === 'number') {
        await cartService.removeDiscountCode(
          authService.apiRoot,
          CurrentCart.id!,
          version,
          discountCodeId,
        );
        cartService.updateTotalPrice();
      }
    }
  }
}
