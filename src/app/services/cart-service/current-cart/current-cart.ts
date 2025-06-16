import type { Cart, LineItem } from '@commercetools/platform-sdk';
import { CentPrecisionMoney } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/common';
import { signal } from '@angular/core';

export class CurrentCart {
  public static cart = signal<Cart | null>(null);

  public static get version() {
    return this.cart()?.version || 1;
  }

  public static get getCart() {
    return this.cart;
  }

  public static get id() {
    return this.cart()?.id;
  }

  public static get products(): LineItem[] {
    return this.cart()?.lineItems ?? [];
  }

  public static get price(): CentPrecisionMoney {
    return (
      this.cart()?.totalPrice ?? {
        type: 'centPrecision',
        centAmount: 0,
        currencyCode: 'USD',
        fractionDigits: 2,
      }
    );
  }

  public static setCart(cart: Cart | null) {
    if (cart) {
      this.cart.set(cart);
      localStorage.setItem('current-cart', JSON.stringify(cart));
    }
  }

  public static isCart() {
    return !!this.cart;
  }

  public static deleteCart() {
    this.cart.set(null);
    localStorage.removeItem('current-cart');
  }

  public static getProductCount(productKey: string) {
    const { products } = this;
    if (products.length) {
      const selectedProduct = products.find((product) => product.key === productKey);
      return selectedProduct?.quantity ?? 0;
    }
    return 0;
  }

  public static isProductByID(productID: string) {
    const { products } = this;
    if (products.length > 0) {
      const selectedProduct = products.find((product) => product.productId === productID);
      return !!selectedProduct;
    }
    return false;
  }

  public static getProductCountByID(productID: string) {
    const { products } = this;
    if (products.length) {
      const selectedProduct = products.find((product) => product.productId === productID);
      return selectedProduct?.quantity ?? 0;
    }
    return 0;
  }

  public static getLineItemIdByProductId(productID: string) {
    const { products } = this;
    if (products.length) {
      const selectedProduct = products.find((product) => product.productId === productID);
      return selectedProduct?.id ?? '';
    }
    return '';
  }
}
