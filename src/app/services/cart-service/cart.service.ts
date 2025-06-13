import { inject, Injectable } from '@angular/core';
import { Customer } from '@commercetools/platform-sdk';
import { AuthService } from '@services/auth-service';
import { CurrentCart } from './currentCart/current-cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private authService: AuthService = inject(AuthService);
  public async createNewCustomerCart(ID: Customer['id']) {
    void this;
    try {
      const cartCreateResp = await this.authService.apiRoot
        .carts()
        .post({ body: { currency: 'USD', customerId: ID } })
        .execute();
      return {
        cartID: cartCreateResp.body.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async createAnonymousCart() {
    void this;
    await this.authService.apiRoot
      .carts()
      .post({ body: { currency: 'USD' } })
      .execute()
      .then((response) => {
        CurrentCart.setCart(response.body);
      })
      .catch((error) => {
        if (error instanceof Error) {
          return error.message;
        }
        return String(error);
      });
  }

  public async makePurchases(id: string, version: number, currentProductId: string, quantity = 1) {
    void this;
    await this.authService.apiRoot
      .carts()
      .withId({ ID: id })
      .post({
        body: {
          version: version,
          actions: [
            {
              action: 'addLineItem',
              productId: currentProductId,
              variantId: 1,
              quantity,
            },
          ],
        },
      })
      .execute()
      .then((response) => {
        CurrentCart.setCart(response.body);
      })
      .catch((error) => {
        if (error instanceof Error) {
          return error.message;
        }
        return String(error);
      });
  }

  public async currentVersionCart(cartId: string) {
    void this;
    try {
      const currentVersionCart = await this.authService.apiRoot
        .carts()
        .withId({ ID: cartId })
        .get()
        .execute();
      return currentVersionCart.body.version;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }
}
