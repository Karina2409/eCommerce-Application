import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import { ProductDetailComponent } from '@components/product-detail';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardImage,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'app-product-card',
  imports: [
    MatButton,
    NgForOf,
    NgIf,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardImage,
    MatCardActions,
    ProductDetailComponent,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) public product!: ProductProjection;
  public category: string | null = '';
  public subcategory: string | null = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public get allVariants(): ProductVariant[] {
    return [this.product.masterVariant, ...this.product.variants];
  }

  public slugify(text: string): string {
    void this;
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }

  public openProductPage(variant: ProductVariant): void {
    const name = this.getName();
    this.router.navigate([
      '/catalog',
      this.category,
      this.subcategory,
      this.slugify(name),
      variant.id,
    ]);
  }

  public getName(locale = 'en-US'): string {
    return this.product.name[locale] || Object.values(this.product.name)[0];
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

  public getDescription(locale = 'en-US'): string {
    return this.product.description?.[locale] || '';
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
      this.subcategory = params.get('subcategoryName');
    });
  }
}
