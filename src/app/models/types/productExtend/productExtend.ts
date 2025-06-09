import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';

export type ProductProjectionExtend = {
  variantsRender?: ProductVariant[];
} & ProductProjection;
