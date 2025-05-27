import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  public category: string | null = null;
  public sortOption: keyof Product = 'name';

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

  public get sortedProducts(): Product[] {
    if (!this.sortOption) return this.products;

    return this.products
      .filter((product) => product.category === this.category)
      .sort((a, b) => {
        const option = this.sortOption;

        if (typeof a[option] === 'number' && typeof b[option] === 'number') {
          return a[option] - b[option];
        }

        return String(a[option]).localeCompare(String(b[option]));
      });
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
    });
  }
}
