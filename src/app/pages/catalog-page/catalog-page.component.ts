import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { ProductCardComponent } from '@components/product-card';
import { ProductService } from '@services/product-service';
import { ProductProjection } from '@commercetools/platform-sdk';
import { FilterService } from '@services/filter-service';
import { SortService } from '@services/sort-service/sort.service';

@Component({
  selector: 'app-catalog-page',
  imports: [
    NgForOf,
    TitleCasePipe,
    MatButtonModule,
    FormsModule,
    MatSelect,
    MatOption,
    MatLabel,
    ProductCardComponent,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  public productService: ProductService = inject(ProductService);
  public filterService: FilterService = inject(FilterService);
  public sortService: SortService = inject(SortService);
  public category: string | null = '';
  public subcategory: string | null = '';
  public categories: Record<string, string> = {};
  public subcategories: Record<
    string,
    {
      id: string;
      parentId: string;
    }
  > = {};
  public parentId = '';
  public targetId = '';
  public products = signal<ProductProjection[]>([]);
  public allAttributeValues = new Set();
  public brands: string[] = [];
  public selectedBrand = '';
  public sortOption = 'name.en-US asc';

  constructor(private route: ActivatedRoute) {}

  public onValueFilterChange(filterValue: string) {
    this.getFilterProducts(filterValue);
  }

  public onValueSortChange(sortValue: string) {
    this.getSortProducts(sortValue);
  }

  public async getFilterProducts(selectedValue: string) {
    const products = await this.filterService.getProductsByQuery(
      selectedValue,
      this.targetId,
      this.sortOption,
    );

    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }

  public async getSortProducts(selectedValue: string) {
    const products = await this.sortService.getProductsByQuery(
      this.targetId,
      selectedValue,
      this.selectedBrand,
    );

    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
      this.subcategory = params.get('subcategoryName');
    });
    this.productService
      .getCategoriesData()
      .then(() => {
        this.categories = this.productService.categories;
        for (const key in this.categories) {
          if (key === this.category) {
            this.parentId = this.categories[key];
          }
        }
        this.subcategories = this.productService.subcategories;
        for (const key in this.subcategories) {
          if (key === this.subcategory) {
            this.targetId = this.subcategories[key].id;
          }
        }
      })
      .then(() => {
        this.productService.getAllProductsByCategory(this.targetId).then((products) => {
          if (Array.isArray(products)) {
            this.products.set(products);
          }

          this.products().forEach((product) => {
            if (product.masterVariant && product.masterVariant.attributes) {
              const attributeValue = product.masterVariant.attributes.find(
                (attr) => attr.name === 'brand',
              )?.value;
              if (attributeValue !== undefined) {
                this.allAttributeValues.add(attributeValue);
              }
            }
          });

          for (const value of this.allAttributeValues) {
            if (Array.isArray(value)) {
              this.brands.push(value[0].key);
            }
          }
        });
      });
  }
}
