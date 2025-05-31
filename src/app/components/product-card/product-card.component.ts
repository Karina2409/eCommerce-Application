import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-product-card',
  imports: [MatButton, NgForOf, NgIf],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) public product!: ProductProjection;

  public get allVariants(): ProductVariant[] {
    return [this.product.masterVariant, ...this.product.variants];
  }

  public getName(locale = 'en-US'): string {
    return this.product.name[locale] || Object.values(this.product.name)[0];
  }

  /* eslint-disable class-methods-use-this */
  public getAttribute(variant: ProductVariant, attribute: string, locale = 'en-US'): string | null {
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

  public getDescription(locale = 'en-US'): string {
    return this.product.description?.[locale] || '';
  }
}
