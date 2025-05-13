import {
  Address,
  AuthenticationMode,
  CreatedBy,
  CustomerGroupReference,
  LastModifiedBy,
  StoreKeyReference,
} from '@commercetools/platform-sdk';

export type Customer = {
  readonly addresses: Address[];
  readonly authenticationMode: AuthenticationMode;
  readonly billingAddressIds?: string[];
  readonly createdAt: string;
  readonly createdBy?: CreatedBy;
  readonly customerGroup?: CustomerGroupReference;
  readonly email: string;
  readonly firstName?: string;
  readonly id: string;
  readonly isEmailVerified: boolean;
  readonly lastMessageSequenceNumber?: number;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy?: LastModifiedBy;
  readonly lastName?: string;
  readonly middleName?: string;
  readonly password?: string;
  readonly shippingAddressIds?: string[];
  readonly stores: StoreKeyReference[];
  readonly version: number;
  readonly versionModifiedAt?: string;
};
