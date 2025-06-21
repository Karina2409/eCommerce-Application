import type { Customer } from '@commercetools/platform-sdk';

export class CustomerInfo {
  private static customer: Customer | null = null;

  public static get version() {
    return this.customer?.version || 1;
  }

  public static get getCustomer() {
    return this.customer;
  }

  public static get id() {
    return this.customer?.id;
  }

  public static setCustomer(customer: Customer | null) {
    if (customer) {
      this.customer = customer;
    }
  }

  public static isCustomer() {
    return !!this.customer;
  }

  public static deleteCustomer() {
    this.customer = null;
    localStorage.removeItem('current-cart');
  }
}
