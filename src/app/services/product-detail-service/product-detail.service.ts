import { Injectable } from '@angular/core';
import { ProductVariant } from '@commercetools/platform-sdk';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailService {
  public getAttribute(variant: ProductVariant, attribute: string, locale = 'en-US'): string | null {
    void this;
    const attr = variant.attributes?.find((a) => a.name === attribute);
    if (!attr) return null;

    const value = attr.value;

    if (Array.isArray(value) && value.length > 0) {
      const firstItem = value[0];
      if (firstItem.label && typeof firstItem.label === 'object') {
        return firstItem.label[locale] || firstItem.key || null;
      }
      return firstItem.key || null;
    }
    if (
      value.type === 'centPrecision' &&
      'centAmount' in value &&
      'currencyCode' in value &&
      'fractionDigits' in value
    ) {
      const amount = value.centAmount / Math.pow(10, value.fractionDigits);
      return `${amount.toFixed(value.fractionDigits)} ${value.currencyCode}`;
    }
    if (value && typeof value === 'object') {
      if ('label' in value) return value.label[locale] || value.key || null;
      if ('key' in value) return value.key;
    }

    return null;
  }

  public getDiscountedPrice(variant: ProductVariant): string | undefined {
    void this;
    const priceArray = variant?.prices;
    let result;
    if (priceArray) {
      const centAmount = priceArray[0].discounted?.value.centAmount;
      if (centAmount === undefined) {
        return '';
      }
      const fractionDigits = priceArray[0].discounted?.value?.fractionDigits;
      const currencyCode = priceArray[0].discounted?.value?.currencyCode;
      let amount;
      if (centAmount && fractionDigits) {
        amount = centAmount / Math.pow(10, fractionDigits);
      }
      result = `${amount?.toFixed(fractionDigits)} ${currencyCode}`;
    }

    return result;
  }

  public getProductId(variant: ProductVariant): string | undefined {
    void this;
    const priceArray = variant?.prices;
    let result;
    if (priceArray) {
      const centAmount = priceArray[0].discounted?.value.centAmount;
      if (centAmount === undefined) {
        return '';
      }
      const fractionDigits = priceArray[0].discounted?.value?.fractionDigits;
      const currencyCode = priceArray[0].discounted?.value?.currencyCode;
      let amount;
      if (centAmount && fractionDigits) {
        amount = centAmount / Math.pow(10, fractionDigits);
      }
      result = `${amount?.toFixed(fractionDigits)} ${currencyCode}`;
    }

    return result;
  }
}
