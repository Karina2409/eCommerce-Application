import { Component, effect, OnInit, signal } from '@angular/core';
import { NgForOf, NgIf, Location } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Image, ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '@services/product-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MatButton, NgForOf, NgIf, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  public locale = 'en-US';
  public images: Image[] = [];
  public currentImgIndex = 0;
  public slug = signal<string | null>(null);
  public product = signal<ProductProjection | null>(null);
  public variantId = 1;
  public allVariants: ProductVariant[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private location: Location,
  ) {
    effect(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.fetchProductBySlug(currentSlug);
      }
    });
  }

  public selectImg(index: number) {
    this.currentImgIndex = index;
  }

  public prevImg() {
    if (this.currentImgIndex > 0) {
      this.currentImgIndex--;
    }
  }

  public nextImg() {
    if (this.currentImgIndex < this.images.length - 1) {
      this.currentImgIndex++;
    }
  }

  public ngOnInit() {
    const slugFromRoute = this.route.snapshot.paramMap.get('name');
    const idFromRoute = this.route.snapshot.paramMap.get('id');
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

  public goBack() {
    this.location.back();
  }

  private async fetchProductBySlug(slug: string) {
    try {
      const response = await this.productService.getProductBySlug(slug);
      this.product.set(response.body.results[0] ?? null);
      this.allVariants = [this.product()!.masterVariant, ...this.product()!.variants];
      this.images = this.allVariants[this.variantId - 1].images ?? [];
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  }
}
