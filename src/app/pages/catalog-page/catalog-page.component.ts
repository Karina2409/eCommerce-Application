import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, TitleCasePipe } from '@angular/common';
import { Product } from '@models/types';

@Component({
  selector: 'app-catalog-page',
  imports: [NgForOf, TitleCasePipe],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  public category: string | null = null;

  public products: Product[] = [
    {
      name: 'Nothing',
      price: 25,
      category: 'smartphones',
      image: [],
      brand: 'Nothing',
      color: 'black',
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
  public get filteredProducts() {
    return this.products.filter((product) => product.category === this.category);
  }

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('categoryName');
    });
  }
}
