import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { ProductCardComponent } from '@components/product-card';
import { ProductService } from '@services/product-service';
import { FilterService } from '@services/filter-service';
import { SortService } from '@services/sort-service';
import { MatIcon } from '@angular/material/icon';
import { ProductProjectionExtend } from '@models/index';

@Component({
  selector: 'app-catalog-page',
  imports: [
    NgForOf,
    MatButtonModule,
    FormsModule,
    MatSelect,
    MatOption,
    MatLabel,
    ProductCardComponent,
    KeyValuePipe,
    NgIf,
    MatIcon,
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
  public products = signal<ProductProjectionExtend[]>([]);
  public allAttributeValues = new Set();
  public brands: string[] = [];
  public colors: string[] = [];
  public selectedValue = '';
  public sortOption = 'name.en-US asc';
  public searchQuery = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public clearSearchQuery() {
    this.searchQuery.set('');
  }

  public onValueFilterChange(filterValue: string, attribute: string) {
    this.getFilterProducts(filterValue, attribute);
  }

  public onValueSortChange(sortValue: string) {
    this.getSortProducts(sortValue);
  }

  public async getFilterProducts(selectedValue: string, attribute: string) {
    const products = await this.filterService.getProductsByQuery(
      selectedValue,
      this.targetId,
      this.sortOption,
      attribute,
    );

    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }

  public async getSortProducts(selectedValue: string) {
    const products = await this.sortService.getProductsByQuery(
      this.targetId,
      selectedValue,
      this.selectedValue,
    );
    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }
  public onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.innerText;
    if (category === '') {
      this.router.navigate(['/catalog']);
    } else {
      this.router.navigate(['/catalog', category]);
    }
  }

  public onSubcategoryChange(subcategory: string) {
    this.router.navigate([`/catalog/${this.category}`, `${subcategory}`]);
  }

  public async getProducts(selectedValue: string) {
    const products = await this.filterService.getProductsByQuery(selectedValue, this.targetId);

    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
      if (this.category === null) {
        this.category = '';
      }
      this.subcategory = params.get('subcategoryName');
      if (this.subcategory === null) {
        this.subcategory = 'All';
      }
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
              )?.value[0].key;
              if (attributeValue !== undefined) {
                this.allAttributeValues.add(attributeValue);
              }
            }
          });

          for (const value of this.allAttributeValues) {
            if (typeof value === 'string') {
              this.brands.push(value);
            }
          }

          this.allAttributeValues.clear();

          this.products().forEach((product) => {
            if (product.variants && product.masterVariant.attributes) {
              const attributeValue = product.masterVariant.attributes.find(
                (attr) => attr.name === 'color',
              )?.value[0].key;
              if (attributeValue !== undefined) {
                this.allAttributeValues.add(attributeValue);
              }
            }
            product.variants.map((variant) => {
              const color = variant.attributes?.find((attr) => attr.name === 'color')?.value[0].key;
              if (color) this.allAttributeValues.add(color);
            });
          });

          for (const value of this.allAttributeValues) {
            if (typeof value === 'string') {
              this.colors.push(value);
            }
          }
        });
      });
  }
}
