import { Customer } from './customer';

export type SignUpResult = {
  result: true | false;
  message: string;
  customer?: Customer;
};
