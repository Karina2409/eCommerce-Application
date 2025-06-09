import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { ProductCardComponent } from '@components/product-card';
import { ProductService } from '@services/product-service';
import { FilterService } from '@services/filter-service';
import { MatIcon } from '@angular/material/icon';
import { ProductProjectionExtend } from '@models/index';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    NgForOf,
    MatButtonModule,
    MatExpansionModule,
    FormsModule,
    MatSelect,
    MatOption,
    MatLabel,
    ProductCardComponent,
    KeyValuePipe,
    NgIf,
    MatIcon,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  @Input() public minPrice = 0;
  @Input() public maxPrice = 10000;
  public productService: ProductService = inject(ProductService);
  public filterService: FilterService = inject(FilterService);
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
  public selectedBrandValue = '';
  public selectedColorValue = '';
  public sortOption = 'name.en-US asc';
  public searchQuery = '';
  public priceFrom: number | null = 0;
  public priceTo: number | null = 10000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public onPriceChange(text: string, price: number | null) {
    if (text === 'priceFrom') {
      this.priceFrom = price;
    } else if (text === 'priceTo') {
      this.priceTo = price;
    } else {
      this.priceFrom = null;
    }
  }

  //Валидация: Проверка, что "Цена От" не больше "Цены До"
  public isFromGreaterThanTo(): boolean {
    if (this.priceFrom !== null && this.priceTo !== null) {
      return this.priceFrom > this.priceTo;
    }
    return false;
  }

  //Валидация: Проверка, что цена находится в заданном диапазоне (minPrice - maxPrice)
  public isPriceOutOfRange(price: number | null): boolean {
    if (price === null) {
      return true;
    }
    return price < this.minPrice || price > this.maxPrice;
  }

  public applyPriceRange() {
    this.getProducts();
  }

  public onFiltersReset() {
    this.selectedBrandValue = '';
    this.selectedColorValue = '';
    this.sortOption = 'name.en-US asc';
    this.searchQuery = '';
    this.priceFrom = 0;
    this.priceTo = 10000;
    this.getProducts();
  }

  public clearSearchQuery() {
    this.searchQuery = '';
    this.getProducts();
  }

  public onValueFilterChange() {
    this.getProducts();
  }

  public onSearchQuery(searchQuery: string) {
    this.getProducts(searchQuery);
  }

  public onValueSortChange() {
    this.getProducts();
  }

  public async getProducts(search?: string) {
    const products = await this.filterService.getProductsByQuery(
      this.selectedBrandValue,
      this.selectedColorValue,
      this.targetId,
      this.priceFrom,
      this.priceTo,
      this.sortOption,
      search,
    );

    if (Array.isArray(products)) {
      this.products.set(products);
    }
  }

  public onCategoryChange(category: string) {
    if (category === '') {
      this.router.navigate(['/catalog']);
    } else {
      this.router.navigate(['/catalog', category]);
    }
  }

  public onSubcategoryChange(subcategory: string) {
    this.router.navigate([`/catalog/${this.category}`, `${subcategory}`]);
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

        for (const category of Object.entries(this.categories)) {
          const [key, value] = category;
          if (key === this.category) {
            this.parentId = value;
          }
        }
        this.subcategories = this.productService.subcategories;
        for (const subcategory of Object.entries(this.subcategories)) {
          const [key, value] = subcategory;
          if (key === this.subcategory) {
            this.targetId = value.id;
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
