import { Customer } from '@commercetools/platform-sdk';

export type SignUpResult = {
  result: true | false;
  message: string;
  customer?: Customer;
};
