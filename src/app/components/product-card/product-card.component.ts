import { Component, inject, Input, OnInit } from '@angular/core';
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
import { ProductService } from '@services/product-service';
import { ProductDetailService } from '@services/product-detail-service';

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
  public productService: ProductService = inject(ProductService);
  public productDetailService: ProductDetailService = inject(ProductDetailService);

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
    const slugifiedName = this.slugify(this.getName());
    this.productService
      .getCategoryBySlug(slugifiedName)
      .then((result) => {
        this.category = result.categoryName.toLowerCase();
        this.subcategory = result.subcategoryName.toLowerCase();
      })
      .then(() => {
        this.router.navigate([
          '/catalog',
          this.category,
          this.subcategory,
          slugifiedName,
          variant.id,
        ]);
      });
  }

  public getName(locale = 'en-US'): string {
    return this.product.name[locale] || Object.values(this.product.name)[0];
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
