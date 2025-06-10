export type ProductProjectionQueryArgs = {
  [key: string]: string | string[] | boolean | number | undefined;
  where?: string;
  limit?: number;
  offset?: number;
  sort?: string | string[];
  staged?: boolean;
  expand?: string | string[];
  priceCurrency?: string;
  priceCountry?: string;
  priceCustomerGroup?: string;
  priceCustomerGroupAssignments?: string | string[];
};
