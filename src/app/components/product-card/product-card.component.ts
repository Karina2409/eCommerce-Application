import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { ProductVariant } from '@commercetools/platform-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardActions, MatCardContent, MatCardImage } from '@angular/material/card';
import { ProductService } from '@services/product-service';
import { ProductDetailService } from '@services/product-detail-service';
import { ProductProjectionExtend } from '@models/index';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormattingToolsService } from '@services/formatting-tools';

@Component({
  selector: 'app-product-card',
  imports: [MatButton, NgForOf, NgIf, MatCard, MatCardContent, MatCardImage, MatCardActions],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) public product!: ProductProjectionExtend;
  public allVariants: ProductVariant[] = [];
  public name = '';
  public description = '';
  public category: string | null = '';
  public subcategory: string | null = '';
  public productService: ProductService = inject(ProductService);
  public productDetailService: ProductDetailService = inject(ProductDetailService);
  public formattingToolsService: FormattingToolsService = inject(FormattingToolsService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {}

  public async openProductPage(variant: ProductVariant): Promise<void> {
    const slugifiedName = this.formattingToolsService.slugify(this.name);

    try {
      const response = await this.productService.getCategoryBySlug(slugifiedName);

      this.category = response.categoryName.toLowerCase();
      this.subcategory = response.subcategoryName.toLowerCase();

      await this.router.navigate([
        '/catalog',
        this.category,
        this.subcategory,
        slugifiedName,
        variant.id,
      ]);
    } catch (err) {
      throw new Error('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  public getName(locale = 'en-US'): void {
    this.name = this.product.name[locale] || Object.values(this.product.name)[0];
  }

  public getDescription(locale = 'en-US'): void {
    this.description = this.product.description?.[locale] || '';
  }

  public isHasDiscount(variant: ProductVariant): boolean {
    void this;
    return !!variant?.prices?.[0]?.discounted?.value?.centAmount;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      if (this.product.variantsRender) {
        this.allVariants = [...this.product.variantsRender];
      } else {
        this.allVariants = [this.product.masterVariant];
      }
    }
  }

  public ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.category = params.get('categoryName');
      this.subcategory = params.get('subcategoryName');
    });

    this.getName();
    this.getDescription();
  }
}
