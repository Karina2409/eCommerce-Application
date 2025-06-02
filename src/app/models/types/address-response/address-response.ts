export type AddressResponse = {
  id?: string;
  streetName?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  state?: string;
  billingAddressIds?: string[];
  shippingAddressIds?: string[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
};
