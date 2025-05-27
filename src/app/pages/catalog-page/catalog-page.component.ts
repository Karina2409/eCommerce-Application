import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgForOf, TitleCasePipe } from '@angular/common';
import { Product } from '@models/types';
import { MatButton } from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-catalog-page',
  imports: [
    NgForOf,
    TitleCasePipe,
    MatButton,
    MatButtonModule,
    FormsModule,
    MatSelect,
    MatOption,
    MatLabel,
    RouterLink,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  public sortOption: keyof Product = 'name';

  public search = '';
  public selectedCategory: string | null = '';
  public selectedBrand = '';
  public selectedColor = '';

  public products: Product[] = [
    {
      name: 'Nothing',
      price: 25,
      category: 'smartphones',
      image: ['assets/images/nothing.jpeg'],
      brand: 'Nothing',
      color: 'white',
    },
    {
      name: 'Galaxy',
      price: 40,
      category: 'smartphones',
      image: ['assets/images/nothing.jpeg'],
      brand: 'Samsung',
      color: 'black',
    },
    {
      name: 'Iphone',
      price: 60,
      category: 'smartphones',
      image: ['assets/images/nothing.jpeg'],
      brand: 'Apple',
      color: 'green',
    },
    {
      name: 'Thinkpad',
      price: 300,
      category: 'laptops',
      image: [],
      brand: 'Lenovo',
      color: 'black',
    },
    {
      name: 'IPad',
      price: 20,
      category: 'tablets',
      image: [],
      brand: 'Apple',
      color: 'white',
    },
  ];

  constructor(private route: ActivatedRoute) {}

  public get categories(): string[] {
    return [...new Set(this.products.map((product) => product.category))];
  }

  public get brands(): string[] {
    return [...new Set(this.products.map((product) => product.brand))];
  }

  public get colors(): string[] {
    return [...new Set(this.products.map((product) => product.color))];
  }

  public get filteredProducts(): Product[] {
    let filteredProducts = this.products.filter(
      (product) =>
        (!this.search || product.name.toLowerCase().includes(this.search.toLowerCase())) &&
        (!this.selectedCategory || product.category === this.selectedCategory) &&
        (!this.selectedBrand || product.brand === this.selectedBrand) &&
        (!this.selectedColor || product.color === this.selectedColor),
    );

    if (this.sortOption) {
      filteredProducts = filteredProducts.sort((a, b) => {
        const option = this.sortOption;

        if (typeof a[option] === 'number' && typeof b[option] === 'number') {
          return a[option] - b[option];
        }

        return String(a[option]).localeCompare(String(b[option]));
      });
    }

    return filteredProducts;
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.selectedCategory = params.get('categoryName');
    });
  }
}
