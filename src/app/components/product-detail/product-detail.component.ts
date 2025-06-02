import { Component, effect, OnInit, signal } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { NgForOf, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@services/product-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    MatButton,
    NgForOf,
    NgIf,
    MatDialogClose,
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  public locale = 'en-US';
  // // public data = inject(MAT_DIALOG_DATA);
  // // public variant = inject(MAT_DIALOG_DATA).variant;
  // public images = this.variant?.images ?? [];
  // public currentImgIndex = 0;

  // public selectImg(index: number) {
  //   this.currentImgIndex = index;
  // }
  //
  // public prevImg() {
  //   if (this.currentImgIndex > 0) {
  //     this.currentImgIndex--;
  //   }
  // }
  //
  // public nextImg() {
  //   if (this.currentImgIndex < this.images.length - 1) {
  //     this.currentImgIndex++;
  //   }
  // }

  public slug = signal<string | null>(null);
  public product = signal<ProductProjection | null>(null);
  public variantId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
  ) {
    effect(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.fetchProductBySlug(currentSlug);
      }
    });
  }

  public ngOnInit() {
    const slugFromRoute = this.route.snapshot.paramMap.get('name');
    const idFromRoute = this.route.snapshot.paramMap.get('name');
    this.slug.set(slugFromRoute);
    if (idFromRoute) this.variantId = Number(idFromRoute);
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

  private async fetchProductBySlug(slug: string) {
    try {
      const response = await this.productService.getProductBySlug(slug);
      this.product.set(response.body.results[0] ?? null);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  }
}
