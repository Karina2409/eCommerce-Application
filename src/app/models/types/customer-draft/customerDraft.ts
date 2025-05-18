import { Address } from '@models/index';

export type CustomerDraft = {
  addresses: Address[];
  billingAddresses: [];
  dateOfBirth: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  shippingAddresses: [];
};
