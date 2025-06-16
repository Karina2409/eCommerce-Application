import { Injectable } from '@angular/core';
import { ByProjectKeyRequestBuilder, Customer, LineItem } from '@commercetools/platform-sdk';
import { CurrentCart } from '@services/cart-service/current-cart/current-cart';
import { BehaviorSubject } from 'rxjs';
import { CentPrecisionMoney } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public countSubject = new BehaviorSubject<number>(0);
  public count$ = this.countSubject.asObservable();

  public priceSubject = new BehaviorSubject<CentPrecisionMoney>({
    type: 'centPrecision',
    centAmount: 0,
    currencyCode: 'USD',
    fractionDigits: 2,
  });
  public price$ = this.priceSubject.asObservable();
  public productsSubject = new BehaviorSubject<LineItem[]>([]);
  public products$ = this.productsSubject.asObservable();

  public async createRegisteredCart(apiRoot: ByProjectKeyRequestBuilder, ID: Customer['id']) {
    void this;
    try {
      const products = CurrentCart.products;
      const cartCreateResp = await apiRoot
        .carts()
        .post({ body: { currency: 'USD', customerId: ID } })
        .execute();
      CurrentCart.setCart(cartCreateResp.body);
      for (const product of products) {
        const { productId, quantity } = product;
        const version = CurrentCart.version;
        if (CurrentCart.id) {
          const cartId = CurrentCart.id;
          await this.makePurchases(apiRoot, cartId, version, productId, quantity);
        }
      }
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

  public async createAnonymousCart(apiRoot: ByProjectKeyRequestBuilder) {
    void this;
    await apiRoot
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

  public async getCartByCustomerId(apiRoot: ByProjectKeyRequestBuilder, customerId: string) {
    void this;
    try {
      const cart = await apiRoot.carts().withCustomerId({ customerId: customerId }).get().execute();

      CurrentCart.setCart(cart.body);

      return cart.body;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public async makePurchases(
    apiRoot: ByProjectKeyRequestBuilder,
    id: string,
    version: number,
    currentProductId: string,
    quantity = 1,
  ) {
    void this;
    await apiRoot
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

  public async removePurchases(
    apiRoot: ByProjectKeyRequestBuilder,
    id: string,
    version: number,
    lineItemId: string,
    quantity = 1,
  ) {
    void this;
    await apiRoot
      .carts()
      .withId({ ID: id })
      .post({
        body: {
          version: version,
          actions: [
            {
              action: 'removeLineItem',
              lineItemId,
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

  public async currentVersionCart(apiRoot: ByProjectKeyRequestBuilder, cartId: string) {
    void this;
    try {
      const currentVersionCart = await apiRoot.carts().withId({ ID: cartId }).get().execute();
      return currentVersionCart.body.version;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
  }

  public updateCartProductCount() {
    this.countSubject.next(CurrentCart.products.length);
  }

  public updateTotalPrice() {
    this.priceSubject.next(CurrentCart.price);
  }

  public updateProducts() {
    this.productsSubject.next(CurrentCart.products);
  }

  public async applyDiscountCode(
    apiRoot: ByProjectKeyRequestBuilder,
    cartId: string,
    version: number,
    discountCode: string,
  ) {
    void this;
    await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: version,
          actions: [
            {
              action: 'addDiscountCode',
              code: discountCode,
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
}
