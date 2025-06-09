import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
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
  @Input() public maxPrice = 1000000;
  @Output() public priceRangeChange = new EventEmitter<{
    from: number | null;
    to: number | null;
  }>();
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
  public searchQuery = signal('');
  public priceFrom: number | null = 0;
  public priceTo: number | null = 10000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public onPriceFromChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      this.priceFrom = parsedValue;
      this.emitPriceRange();
    } else {
      this.priceFrom = null;
      this.emitPriceRange();
    }
  }

  public onPriceToChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      this.priceTo = parsedValue;
      this.emitPriceRange();
    } else {
      this.priceTo = null;
      this.emitPriceRange();
    }
  }

  public emitPriceRange() {
    this.priceRangeChange.emit({ from: this.priceFrom, to: this.priceTo });
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
      return false;
    }
    return price < this.minPrice || price > this.maxPrice;
  }

  public onApply() {
    this.getProducts();
  }

  public onFiltersReset() {
    this.targetId = '';
    this.selectedBrandValue = '';
    this.selectedColorValue = '';
    this.sortOption = 'name.en-US asc';
    this.searchQuery = signal('');
    this.priceFrom = 0;
    this.priceTo = 10000;
    this.getProducts();
  }

  public clearSearchQuery() {
    this.searchQuery.set('');
  }

  public onValueFilterChange() {
    this.getProducts();
  }

  public onValueSortChange() {
    this.getProducts();
  }

  public async getProducts() {
    const products = await this.filterService.getProductsByQuery(
      this.selectedBrandValue,
      this.selectedColorValue,
      this.targetId,
      this.priceFrom,
      this.priceTo,
      this.sortOption,
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
